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
const notifications_service_1 = require("../notifications/notifications.service");
const prisma_service_1 = require("../prisma/prisma.service");
let OrdersService = class OrdersService {
    prisma;
    notificationsService;
    constructor(prisma, notificationsService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
    }
    mapOrder(order) {
        const items = Array.isArray(order.items) ? order.items : [];
        const createdAt = order.createdAt;
        return {
            id: order.orderNumber,
            dbId: order.id,
            userId: order.userId,
            customer: order.customerName,
            email: order.customerEmail,
            phone: order.customerPhone || '—',
            address: order.address || '—',
            city: order.city || '—',
            notes: order.notes || '',
            items,
            itemCount: items.length,
            subtotal: order.subtotal,
            deliveryTotal: order.deliveryTotal,
            total: order.total,
            status: order.status,
            payment: order.paymentMethod,
            date: createdAt.toLocaleDateString('en-PK', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            }),
            createdAt: createdAt.toISOString(),
        };
    }
    async create(dto, userId) {
        const orderNumber = dto.orderNumber?.trim() || `ZV-${Date.now().toString().slice(-8)}`;
        const order = await this.prisma.storeOrder.create({
            data: {
                orderNumber,
                userId: userId ?? null,
                customerName: dto.customerName.trim(),
                customerEmail: dto.customerEmail.trim().toLowerCase(),
                customerPhone: dto.phone?.trim() || null,
                address: dto.address?.trim() || null,
                city: dto.city?.trim() || null,
                notes: dto.notes?.trim() || null,
                items: dto.items,
                subtotal: dto.subtotal,
                deliveryTotal: dto.deliveryTotal,
                total: dto.total,
                paymentMethod: dto.paymentMethod?.trim() || 'Cash on Delivery',
            },
        });
        const itemLines = dto.items
            .map((item) => `- ${item.name} x${item.quantity} — Rs. ${(item.price * item.quantity).toLocaleString('en-PK')}`)
            .join('\n');
        await this.notificationsService.notifyAdmin({
            type: 'ORDER',
            title: `New order ${orderNumber}`,
            message: `${order.customerName} placed an order for Rs. ${order.total.toLocaleString('en-PK')}.`,
            linkPath: `/dashboard/admin/orders/${orderNumber}`,
            referenceId: order.id,
            emailSubject: `[Zanvara] New order ${orderNumber}`,
            emailText: [
                `New order received: ${orderNumber}`,
                '',
                `Customer: ${order.customerName}`,
                `Email: ${order.customerEmail}`,
                `Phone: ${order.customerPhone || '—'}`,
                `City: ${order.city || '—'}`,
                `Address: ${order.address || '—'}`,
                '',
                'Items:',
                itemLines,
                '',
                `Subtotal: Rs. ${order.subtotal.toLocaleString('en-PK')}`,
                `Delivery: Rs. ${order.deliveryTotal.toLocaleString('en-PK')}`,
                `Total: Rs. ${order.total.toLocaleString('en-PK')}`,
                `Payment: ${order.paymentMethod}`,
            ].join('\n'),
            emailHtml: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
          <h2 style="margin:0 0 12px">New order ${orderNumber}</h2>
          <p><strong>Customer:</strong> ${order.customerName}</p>
          <p><strong>Email:</strong> ${order.customerEmail}</p>
          <p><strong>Phone:</strong> ${order.customerPhone || '—'}</p>
          <p><strong>City:</strong> ${order.city || '—'}</p>
          <p><strong>Address:</strong> ${order.address || '—'}</p>
          <h3 style="margin:20px 0 8px">Items</h3>
          <ul>${dto.items.map((item) => `<li>${item.name} x${item.quantity} — Rs. ${(item.price * item.quantity).toLocaleString('en-PK')}</li>`).join('')}</ul>
          <p><strong>Total:</strong> Rs. ${order.total.toLocaleString('en-PK')}</p>
          <p><strong>Payment:</strong> ${order.paymentMethod}</p>
        </div>
      `,
        });
        return this.mapOrder(order);
    }
    findAllAdmin() {
        return this.prisma.storeOrder
            .findMany({ orderBy: { createdAt: 'desc' } })
            .then((orders) => orders.map((order) => this.mapOrder(order)));
    }
    async findByOrderNumber(orderNumber) {
        const order = await this.prisma.storeOrder.findUnique({
            where: { orderNumber },
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found.');
        }
        return this.mapOrder(order);
    }
    async updateStatus(orderNumber, status) {
        const order = await this.prisma.storeOrder.update({
            where: { orderNumber },
            data: { status },
        });
        return this.mapOrder(order);
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map