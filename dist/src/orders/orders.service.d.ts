import { MailService } from '../mail/mail.service';
import { AdminNotificationsService } from '../notifications/admin-notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
export declare class OrdersService {
    private readonly prisma;
    private readonly mailService;
    private readonly notificationsService;
    private readonly logger;
    constructor(prisma: PrismaService, mailService: MailService, notificationsService: AdminNotificationsService);
    create(userId: string, dto: CreateOrderDto): Promise<{
        id: string;
        userId: string;
        items: {
            productId: string;
            name: string;
            price: number;
            quantity: number;
            image?: string;
        }[];
        subtotal: number;
        deliveryTotal: number;
        total: number;
        paymentMethod: string;
        customer: {
            fullName: string;
            email: string;
            phone: string;
            address: string;
            city: string;
            notes: string;
        };
        status: string;
        createdAt: string;
        updatedAt: string;
    }>;
    findMine(userId: string): Promise<{
        id: string;
        userId: string;
        items: {
            productId: string;
            name: string;
            price: number;
            quantity: number;
            image?: string;
        }[];
        subtotal: number;
        deliveryTotal: number;
        total: number;
        paymentMethod: string;
        customer: {
            fullName: string;
            email: string;
            phone: string;
            address: string;
            city: string;
            notes: string;
        };
        status: string;
        createdAt: string;
        updatedAt: string;
    }[]>;
    findMineByNumber(userId: string, orderNumber: string): Promise<{
        id: string;
        userId: string;
        items: {
            productId: string;
            name: string;
            price: number;
            quantity: number;
            image?: string;
        }[];
        subtotal: number;
        deliveryTotal: number;
        total: number;
        paymentMethod: string;
        customer: {
            fullName: string;
            email: string;
            phone: string;
            address: string;
            city: string;
            notes: string;
        };
        status: string;
        createdAt: string;
        updatedAt: string;
    }>;
    findAllAdmin(): Promise<{
        id: string;
        customer: string;
        email: string;
        phone: string;
        address: string;
        city: string;
        notes: string;
        total: number;
        subtotal: number;
        deliveryTotal: number;
        items: {
            productId: string;
            name: string;
            price: number;
            quantity: number;
            image?: string;
        }[];
        itemCount: number;
        status: string;
        payment: string;
        date: string;
        createdAt: string;
        updatedAt: string;
        userId: string;
    }[]>;
    findOneAdmin(idOrNumber: string): Promise<{
        id: string;
        customer: string;
        email: string;
        phone: string;
        address: string;
        city: string;
        notes: string;
        total: number;
        subtotal: number;
        deliveryTotal: number;
        items: {
            productId: string;
            name: string;
            price: number;
            quantity: number;
            image?: string;
        }[];
        itemCount: number;
        status: string;
        payment: string;
        date: string;
        createdAt: string;
        updatedAt: string;
        userId: string;
    }>;
    updateStatusAdmin(idOrNumber: string, dto: UpdateOrderStatusDto): Promise<{
        id: string;
        customer: string;
        email: string;
        phone: string;
        address: string;
        city: string;
        notes: string;
        total: number;
        subtotal: number;
        deliveryTotal: number;
        items: {
            productId: string;
            name: string;
            price: number;
            quantity: number;
            image?: string;
        }[];
        itemCount: number;
        status: string;
        payment: string;
        date: string;
        createdAt: string;
        updatedAt: string;
        userId: string;
    }>;
    private applyStockChange;
    private parseOrderItems;
    private findOrderRecord;
}
