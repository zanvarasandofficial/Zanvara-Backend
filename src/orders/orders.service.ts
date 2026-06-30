import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Order, Prisma } from '@prisma/client';
import { MailService } from '../mail/mail.service';
import { AdminNotificationsService } from '../notifications/admin-notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { mapOrder, mapOrderForAdmin } from './order.mapper';

type OrderItem = {
  productId: string;
  name: string;
  quantity: number;
};

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly notificationsService: AdminNotificationsService,
  ) {}

  async create(userId: string, dto: CreateOrderDto) {
    if (!dto.items?.length) {
      throw new BadRequestException('Order must include at least one item.');
    }

    for (const item of dto.items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product || product.status !== 'PUBLISHED') {
        throw new BadRequestException(`${item.name} is no longer available.`);
      }

      if (item.quantity > product.stock) {
        throw new BadRequestException(
          `Only ${product.stock} left in stock for ${item.name}.`,
        );
      }
    }

    const order = await this.prisma.order.create({
      data: {
        orderNumber: `ZV-${Date.now().toString().slice(-8)}`,
        userId,
        status: 'pending',
        paymentMethod: dto.paymentMethod?.trim() || 'Cash on Delivery',
        subtotal: dto.subtotal,
        deliveryTotal: dto.deliveryTotal,
        total: dto.total,
        customerName: dto.customer.fullName.trim(),
        customerEmail: dto.customer.email.trim().toLowerCase(),
        customerPhone: dto.customer.phone.trim(),
        customerAddress: dto.customer.address.trim(),
        customerCity: dto.customer.city.trim(),
        customerNotes: dto.customer.notes?.trim() || null,
        items: dto.items as unknown as Prisma.InputJsonValue,
      },
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
      },
    });

    return mapOrderForAdmin(updated);
  }

  private async applyStockChange(
    order: Order,
    mode: 'decrement' | 'restore',
  ) {
    const items = this.parseOrderItems(order);

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
