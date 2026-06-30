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
exports.AdminNotificationsService = void 0;
const common_1 = require("@nestjs/common");
const role_constant_1 = require("../common/constants/role.constant");
const prisma_service_1 = require("../prisma/prisma.service");
const ORDER = 'ORDER';
const LOGIN = 'LOGIN';
function formatMoney(amount) {
    return `Rs. ${Math.round(amount).toLocaleString('en-PK')}`;
}
let AdminNotificationsService = class AdminNotificationsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    mapNotification(notification) {
        return {
            id: notification.id,
            type: notification.type,
            title: notification.title,
            body: notification.body,
            href: notification.href,
            entityId: notification.entityId,
            status: notification.status,
            createdAt: notification.createdAt,
            updatedAt: notification.updatedAt,
        };
    }
    async findAllAdmin(limit = 50) {
        const notifications = await this.prisma.adminNotification.findMany({
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
        return notifications.map((notification) => this.mapNotification(notification));
    }
    async updateStatus(id, status) {
        const notification = await this.prisma.adminNotification.update({
            where: { id },
            data: { status },
        });
        return this.mapNotification(notification);
    }
    async createOrderNotification(order) {
        const notification = await this.prisma.adminNotification.create({
            data: {
                type: ORDER,
                title: `New order ${order.id}`,
                body: `${order.customer.fullName} placed an order worth ${formatMoney(order.total)}.`,
                href: `/dashboard/admin/orders/${order.id}`,
                entityId: order.id,
            },
        });
        return this.mapNotification(notification);
    }
    async createLoginNotification(user, event, provider) {
        if (user.role === role_constant_1.Role.ADMIN) {
            return null;
        }
        const label = user.name?.trim() || user.email;
        const providerLabel = provider === 'GOOGLE' ? 'Google' : provider === 'OTP' ? 'email OTP' : 'email';
        const notification = await this.prisma.adminNotification.create({
            data: {
                type: LOGIN,
                title: event === 'signup'
                    ? `New signup: ${label}`
                    : `Customer login: ${label}`,
                body: event === 'signup'
                    ? `${label} signed up via ${providerLabel}.`
                    : `${label} logged in via ${providerLabel}.`,
                href: '/dashboard/admin/customers',
                entityId: user.id,
            },
        });
        return this.mapNotification(notification);
    }
};
exports.AdminNotificationsService = AdminNotificationsService;
exports.AdminNotificationsService = AdminNotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminNotificationsService);
//# sourceMappingURL=admin-notifications.service.js.map