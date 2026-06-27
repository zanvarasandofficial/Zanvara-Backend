import { Order } from '@prisma/client';
type OrderItem = {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
};
export declare function mapOrder(order: Order): {
    id: string;
    userId: string;
    items: OrderItem[];
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
};
export declare function mapOrderForAdmin(order: Order): {
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
    items: OrderItem[];
    itemCount: number;
    status: string;
    payment: string;
    date: string;
    createdAt: string;
    updatedAt: string;
    userId: string;
};
export {};
