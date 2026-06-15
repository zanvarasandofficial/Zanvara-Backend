declare class OrderItemDto {
    productId: string;
    name: string;
    quantity: number;
    price: number;
    image?: string;
}
export declare class CreateOrderDto {
    orderNumber?: string;
    items: OrderItemDto[];
    subtotal: number;
    deliveryTotal: number;
    total: number;
    customerName: string;
    customerEmail: string;
    phone?: string;
    address?: string;
    city?: string;
    notes?: string;
    paymentMethod?: string;
}
export {};
