import { Injectable } from '@nestjs/common';
import { Role } from '../common/constants/role.constant';
import { PrismaService } from '../prisma/prisma.service';

const ORDER = 'ORDER';
const LOGIN = 'LOGIN';

function formatMoney(amount: number) {
  return `Rs. ${Math.round(amount).toLocaleString('en-PK')}`;
}

@Injectable()
export class AdminNotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  private mapNotification(notification: {
    id: string;
    type: string;
    title: string;
    body: string;
    href: string | null;
    entityId: string | null;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
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

  async updateStatus(id: string, status: 'NEW' | 'READ') {
    const notification = await this.prisma.adminNotification.update({
      where: { id },
      data: { status },
    });

    return this.mapNotification(notification);
  }

  async createOrderNotification(order: {
    id: string;
    total: number;
    customer: { fullName: string; email: string };
  }) {
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

  async createLoginNotification(
    user: {
      id: string;
      email: string;
      name: string | null;
      role: string;
    },
    event: 'signup' | 'login',
    provider: string,
  ) {
    if (user.role === Role.ADMIN) {
      return null;
    }

    const label = user.name?.trim() || user.email;
    const providerLabel =
      provider === 'GOOGLE' ? 'Google' : provider === 'OTP' ? 'email OTP' : 'email';

    const notification = await this.prisma.adminNotification.create({
      data: {
        type: LOGIN,
        title:
          event === 'signup'
            ? `New signup: ${label}`
            : `Customer login: ${label}`,
        body:
          event === 'signup'
            ? `${label} signed up via ${providerLabel}.`
            : `${label} logged in via ${providerLabel}.`,
        href: '/dashboard/admin/customers',
        entityId: user.id,
      },
    });

    return this.mapNotification(notification);
  }
}
