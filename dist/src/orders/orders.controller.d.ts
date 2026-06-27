import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    create(user: AuthenticatedUser, dto: CreateOrderDto): Promise<{
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
    findMine(user: AuthenticatedUser): Promise<{
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
    findMineByNumber(user: AuthenticatedUser, orderNumber: string): Promise<{
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
}
