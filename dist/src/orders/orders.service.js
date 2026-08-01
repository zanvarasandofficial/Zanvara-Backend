"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var OrdersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const mail_service_1 = require("../mail/mail.service");
const product_fulfillment_util_1 = require("../products/product-fulfillment.util");
const admin_notifications_service_1 = require("../notifications/admin-notifications.service");
const prisma_service_1 = require("../prisma/prisma.service");
const order_mapper_1 = require("./order.mapper");
const payment_rules_util_1 = require("./payment-rules.util");
let OrdersService = OrdersService_1 = class OrdersService {
    prisma;
    mailService;
    notificationsService;
    logger = new common_1.Logger(OrdersService_1.name);
    constructor(prisma, mailService, notificationsService) {
        this.prisma = prisma;
        this.mailService = mailService;
        this.notificationsService = notificationsService;
    }
    async create(userId, dto, req) {
        if (!dto.items?.length) {
            throw new common_1.BadRequestException('Order must include at least one item.');
        }
        const productIds = [...new Set(dto.items.map((item) => item.productId))];
        const products = await this.prisma.product.findMany({
            where: { id: { in: productIds } },
        });
        const productMap = new Map(products.map((product) => [product.id, product]));
        const enrichedItems = [];
        let hasPreOrder = false;
        let hasStandard = false;
        for (const item of dto.items) {
            const product = productMap.get(item.productId);
            if (!product || product.status !== 'PUBLISHED') {
                throw new common_1.BadRequestException(`${item.name} is no longer available.`);
            }
            if ((0, product_fulfillment_util_1.isComingSoonBlocked)(product)) {
                throw new common_1.BadRequestException(`${item.name} is coming soon — available to order after the launch countdown ends.`);
            }
            const mode = (0, product_fulfillment_util_1.getProductFulfillmentMode)(product);
            const purchasable = (0, product_fulfillment_util_1.getPurchasableQuantity)(product);
            if (item.quantity > purchasable) {
                if (mode === 'pre_order') {
                    throw new common_1.BadRequestException(purchasable <= 0
                        ? `Pre-order slots are full for ${item.name}.`
                        : `Only ${purchasable} pre-order slot(s) left for ${item.name}.`);
                }
                throw new common_1.BadRequestException(`Only ${product.stock} left in stock for ${item.name}.`);
            }
            const fulfillmentType = mode === 'pre_order' ? 'PRE_ORDER' : 'STANDARD';
            if (fulfillmentType === 'PRE_ORDER') {
                hasPreOrder = true;
            }
            else {
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
        const hasPreOrderLines = enrichedItems.some((item) => item.fulfillmentType === 'PRE_ORDER');
        const visitorCountry = (0, payment_rules_util_1.resolveOrderVisitorCountry)(dto.customerCountry, req);
        const paymentMethod = (0, payment_rules_util_1.validatePaymentForCountry)(dto.paymentMethod, visitorCountry);
        const order = await this.prisma.$transaction(async (tx) => {
            for (const item of enrichedItems) {
                if (item.fulfillmentType !== 'PRE_ORDER') {
                    continue;
                }
                const product = productMap.get(item.productId);
                const remaining = (0, product_fulfillment_util_1.getPreOrderSlotsRemaining)(product);
                if (item.quantity > remaining) {
                    throw new common_1.BadRequestException(`Only ${remaining} pre-order slot(s) left for ${item.name}.`);
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
                    displayCurrency: dto.displayCurrency === 'USD' ? 'USD' : 'PKR',
                    exchangeRate: dto.displayCurrency === 'USD' && dto.exchangeRate && dto.exchangeRate > 0
                        ? dto.exchangeRate
                        : null,
                    customerCountry: (visitorCountry ?? dto.customerCountry?.trim().toUpperCase()) || null,
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
                    items: enrichedItems,
                },
            });
        });
        const mappedOrder = (0, order_mapper_1.mapOrder)(order);
        void this.mailService.sendNewOrderNotification(mappedOrder).catch((error) => {
            this.logger.error(`Failed to send new order notification for ${mappedOrder.id}`, error);
        });
        void this.notificationsService.createOrderNotification(mappedOrder).catch((error) => {
            this.logger.error(`Failed to create admin order notification for ${mappedOrder.id}`, error);
        });
        return mappedOrder;
    }
    async findMine(userId) {
        const orders = await this.prisma.order.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        return orders.map(order_mapper_1.mapOrder);
    }
    async findMineByNumber(userId, orderNumber) {
        const order = await this.findOrderRecord(orderNumber);
        if (order.userId !== userId) {
            throw new common_1.NotFoundException('Order not found.');
        }
        return (0, order_mapper_1.mapOrder)(order);
    }
    async findAllAdmin() {
        const orders = await this.prisma.order.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return orders.map(order_mapper_1.mapOrderForAdmin);
    }
    async findOneAdmin(idOrNumber) {
        const order = await this.findOrderRecord(idOrNumber);
        return (0, order_mapper_1.mapOrderForAdmin)(order);
    }
    async updateStatusAdmin(idOrNumber, dto) {
        const order = await this.findOrderRecord(idOrNumber);
        const nextStatus = dto.status;
        const previousStatus = order.status;
        if (previousStatus === nextStatus) {
            return (0, order_mapper_1.mapOrderForAdmin)(order);
        }
        if (nextStatus === 'cancelled' && previousStatus !== 'cancelled') {
            await this.releaseOrderReservations(order);
        }
        const shouldDecrement = nextStatus === 'delivered' &&
            previousStatus !== 'delivered' &&
            !order.stockAdjusted;
        const shouldRestore = previousStatus === 'delivered' &&
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
                preOrderAdjusted: nextStatus === 'cancelled' ? false : order.preOrderAdjusted,
            },
        });
        return (0, order_mapper_1.mapOrderForAdmin)(updated);
    }
    async releaseOrderReservations(order) {
        if (!order.preOrderAdjusted) {
            return;
        }
        const items = this.parseOrderItems(order).filter((item) => item.fulfillmentType === 'PRE_ORDER');
        if (!items.length) {
            return;
        }
        await this.prisma.$transaction(items.map((item) => this.prisma.product.update({
            where: { id: item.productId },
            data: {
                preOrderReserved: { decrement: item.quantity },
            },
        })));
    }
    async applyStockChange(order, mode) {
        const items = this.parseOrderItems(order).filter((item) => item.fulfillmentType !== 'PRE_ORDER');
        if (!items.length) {
            return;
        }
        await this.prisma.$transaction(items.map((item) => this.prisma.product.update({
            where: { id: item.productId },
            data: {
                stock: mode === 'decrement'
                    ? { decrement: item.quantity }
                    : { increment: item.quantity },
            },
        })));
    }
    parseOrderItems(order) {
        if (!Array.isArray(order.items)) {
            return [];
        }
        return order.items;
    }
    async findOrderRecord(idOrNumber) {
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
            throw new common_1.NotFoundException('Order not found.');
        }
        return byId;
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = OrdersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        mail_service_1.MailService,
        admin_notifications_service_1.AdminNotificationsService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map