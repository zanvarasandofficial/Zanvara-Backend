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
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const order_mapper_1 = require("./order.mapper");
let OrdersService = class OrdersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
        if (!dto.items?.length) {
            throw new common_1.BadRequestException('Order must include at least one item.');
        }
        for (const item of dto.items) {
            const product = await this.prisma.product.findUnique({
                where: { id: item.productId },
            });
            if (!product || product.status !== 'PUBLISHED') {
                throw new common_1.BadRequestException(`${item.name} is no longer available.`);
            }
            if (item.quantity > product.stock) {
                throw new common_1.BadRequestException(`Only ${product.stock} left in stock for ${item.name}.`);
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
                items: dto.items,
            },
        });
        return (0, order_mapper_1.mapOrder)(order);
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
            },
        });
        return (0, order_mapper_1.mapOrderForAdmin)(updated);
    }
    async applyStockChange(order, mode) {
        const items = this.parseOrderItems(order);
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
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map