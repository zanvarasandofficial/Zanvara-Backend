import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Order, Prisma } from '@prisma/client';
import { MailService } from '../mail/mail.service';
import {
  getProductFulfillmentMode,
  getPreOrderSlotsRemaining,
  getPurchasableQuantity,
  isComingSoonBlocked,
} from '../products/product-fulfillment.util';
import { AdminNotificationsService } from '../notifications/admin-notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { mapOrder, mapOrderForAdmin } from './order.mapper';
import {
  resolveOrderVisitorCountry,
  validatePaymentForCountry,
} from './payment-rules.util';
import type { Request } from 'express';

type OrderItem = {
  productId: string;
  name: string;
  quantity: number;
  price?: number;
  image?: string;
  fulfillmentType?: 'STANDARD' | 'PRE_ORDER';
  expectedShipAt?: string | null;
  expectedShipNote?: string | null;
};

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly notificationsService: AdminNotificationsService,
  ) {}

  async create(userId: string, dto: CreateOrderDto, req: Request) {
    if (!dto.items?.length) {
      throw new BadRequestException('Order must include at least one item.');
    }

    const productIds = [...new Set(dto.items.map((item) => item.productId))];
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });
    const productMap = new Map(products.map((product) => [product.id, product]));

    const enrichedItems: OrderItem[] = [];
    let hasPreOrder = false;
    let hasStandard = false;

    for (const item of dto.items) {
      const product = productMap.get(item.productId);

      if (!product || product.status !== 'PUBLISHED') {
        throw new BadRequestException(`${item.name} is no longer available.`);
      }

      if (isComingSoonBlocked(product)) {
        throw new BadRequestException(
          `${item.name} is coming soon — available to order after the launch countdown ends.`,
        );
      }

      const mode = getProductFulfillmentMode(product);
      const purchasable = getPurchasableQuantity(product);

      if (item.quantity > purchasable) {
        if (mode === 'pre_order') {
          throw new BadRequestException(
            purchasable <= 0
              ? `Pre-order slots are full for ${item.name}.`
              : `Only ${purchasable} pre-order slot(s) left for ${item.name}.`,
          );
        }

        throw new BadRequestException(
          `Only ${product.stock} left in stock for ${item.name}.`,
        );
      }

      const fulfillmentType = mode === 'pre_order' ? 'PRE_ORDER' : 'STANDARD';
      if (fulfillmentType === 'PRE_ORDER') {
        hasPreOrder = true;
      } else {
        hasStandard = true;
      }

      enrichedItems.push({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        fulfillmentType,
        expectedShipAt: product.expectedShipAt?.toISOString() ?? null,
        expectedShipNote: product.expectedShipNote ?? null,
      });
    }

    const fulfillmentKind = hasPreOrder
      ? hasStandard
        ? 'mixed'
        : 'pre_order'
      : 'standard';

    const initialStatus = hasPreOrder ? 'pre_order_confirmed' : 'pending';
    const hasPreOrderLines = enrichedItems.some(
      (item) => item.fulfillmentType === 'PRE_ORDER',
    );

    const visitorCountry = resolveOrderVisitorCountry(
      dto.customerCountry,
      req,
    );
    const paymentMethod = validatePaymentForCountry(
      dto.paymentMethod,
      visitorCountry,
    );

    const order = await this.prisma.$transaction(async (tx) => {
      for (const item of enrichedItems) {
        if (item.fulfillmentType !== 'PRE_ORDER') {
          continue;
        }

        const product = productMap.get(item.productId)!;
        const remaining = getPreOrderSlotsRemaining(product);

        if (item.quantity > remaining) {
          throw new BadRequestException(
            `Only ${remaining} pre-order slot(s) left for ${item.name}.`,
          );
        }

        await tx.product.update({
          where: { id: item.productId },
          data: {
            preOrderReserved: { increment: item.quantity },
          },
        });
      }

      return tx.order.create({
        data: {
          orderNumber: `ZV-${Date.now().toString().slice(-8)}`,
          userId,
          status: initialStatus,
          fulfillmentKind,
          preOrderAdjusted: hasPreOrderLines,
          displayCurrency:
            dto.displayCurrency === 'USD' ? 'USD' : 'PKR',
          exchangeRate:
            dto.displayCurrency === 'USD' && dto.exchangeRate && dto.exchangeRate > 0
              ? dto.exchangeRate
              : null,
          customerCountry:
            (visitorCountry ?? dto.customerCountry?.trim().toUpperCase()) || null,
          paymentMethod,
          subtotal: dto.subtotal,
          deliveryTotal: dto.deliveryTotal,
          total: dto.total,
          customerName: dto.customer.fullName.trim(),
          customerEmail: dto.customer.email.trim().toLowerCase(),
          customerPhone: dto.customer.phone.trim(),
          customerAddress: dto.customer.address.trim(),
          customerCity: dto.customer.city.trim(),
          customerNotes: dto.customer.notes?.trim() || null,
          items: enrichedItems as unknown as Prisma.InputJsonValue,
        },
      });
    });

    const mappedOrder = mapOrder(order);

    void this.mailService.sendNewOrderNotification(mappedOrder).catch((error) => {
      this.logger.error(
        `Failed to send new order notification for ${mappedOrder.id}`,
        error,
      );
    });

    void this.notificationsService.createOrderNotification(mappedOrder).catch((error) => {
      this.logger.error(
        `Failed to create admin order notification for ${mappedOrder.id}`,
        error,
      );
    });

    return mappedOrder;
  }

  async findMine(userId: string) {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map(mapOrder);
  }

  async findMineByNumber(userId: string, orderNumber: string) {
    const order = await this.findOrderRecord(orderNumber);

    if (order.userId !== userId) {
      throw new NotFoundException('Order not found.');
    }

    return mapOrder(order);
  }

  async findAllAdmin() {
    const orders = await this.prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return orders.map(mapOrderForAdmin);
  }

  async findOneAdmin(idOrNumber: string) {
    const order = await this.findOrderRecord(idOrNumber);
    return mapOrderForAdmin(order);
  }

  async updateStatusAdmin(idOrNumber: string, dto: UpdateOrderStatusDto) {
    const order = await this.findOrderRecord(idOrNumber);
    const nextStatus = dto.status;
    const previousStatus = order.status;

    if (previousStatus === nextStatus) {
      return mapOrderForAdmin(order);
    }

    if (nextStatus === 'cancelled' && previousStatus !== 'cancelled') {
      await this.releaseOrderReservations(order);
    }

    const shouldDecrement =
      nextStatus === 'delivered' &&
      previousStatus !== 'delivered' &&
      !order.stockAdjusted;

    const shouldRestore =
      previousStatus === 'delivered' &&
      nextStatus !== 'delivered' &&
      order.stockAdjusted;

    if (shouldDecrement || shouldRestore) {
      await this.applyStockChange(order, shouldDecrement ? 'decrement' : 'restore');
    }

    const updated = await this.prisma.order.update({
      where: { id: order.id },
      data: {
        status: nextStatus,
        stockAdjusted: shouldDecrement
          ? true
          : shouldRestore
            ? false
            : order.stockAdjusted,
        preOrderAdjusted:
          nextStatus === 'cancelled' ? false : order.preOrderAdjusted,
      },
    });

    return mapOrderForAdmin(updated);
  }

  private async releaseOrderReservations(order: Order) {
    if (!order.preOrderAdjusted) {
      return;
    }

    const items = this.parseOrderItems(order).filter(
      (item) => item.fulfillmentType === 'PRE_ORDER',
    );

    if (!items.length) {
      return;
    }

    await this.prisma.$transaction(
      items.map((item) =>
        this.prisma.product.update({
          where: { id: item.productId },
          data: {
            preOrderReserved: { decrement: item.quantity },
          },
        }),
      ),
    );
  }

  private async applyStockChange(
    order: Order,
    mode: 'decrement' | 'restore',
  ) {
    const items = this.parseOrderItems(order).filter(
      (item) => item.fulfillmentType !== 'PRE_ORDER',
    );

    if (!items.length) {
      return;
    }

    await this.prisma.$transaction(
      items.map((item) =>
        this.prisma.product.update({
          where: { id: item.productId },
          data: {
            stock:
              mode === 'decrement'
                ? { decrement: item.quantity }
                : { increment: item.quantity },
          },
        }),
      ),
    );
  }

  private parseOrderItems(order: Order): OrderItem[] {
    if (!Array.isArray(order.items)) {
      return [];
    }

    return order.items as OrderItem[];
  }

  private async findOrderRecord(idOrNumber: string): Promise<Order> {
    const byNumber = await this.prisma.order.findUnique({
      where: { orderNumber: idOrNumber },
    });

    if (byNumber) {
      return byNumber;
    }

    const byId = await this.prisma.order.findUnique({
      where: { id: idOrNumber },
    });

    if (!byId) {
      throw new NotFoundException('Order not found.');
    }

    return byId;
  }
}
