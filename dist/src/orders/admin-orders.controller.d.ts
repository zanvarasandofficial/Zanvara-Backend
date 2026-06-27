import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrdersService } from './orders.service';
export declare class AdminOrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    findAll(): Promise<{
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
    findOne(id: string): Promise<{
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
    updateStatus(id: string, dto: UpdateOrderStatusDto): Promise<{
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
}
