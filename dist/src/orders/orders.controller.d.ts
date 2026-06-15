import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    create(dto: CreateOrderDto, user: AuthenticatedUser): Promise<{
        id: string;
        dbId: string;
        userId: string | null;
        customer: string;
        email: string;
        phone: string;
        address: string;
        city: string;
        notes: string;
        items: import("@prisma/client/runtime/library").JsonArray;
        itemCount: number;
        subtotal: number;
        deliveryTotal: number;
        total: number;
        status: string;
        payment: string;
        date: string;
        createdAt: string;
    }>;
}
