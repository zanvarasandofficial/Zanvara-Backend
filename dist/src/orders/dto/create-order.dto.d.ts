export declare class CreateOrderItemDto {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
}
export declare class CreateOrderCustomerDto {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    notes?: string;
}
export declare class CreateOrderDto {
    items: CreateOrderItemDto[];
    subtotal: number;
    deliveryTotal: number;
    total: number;
    paymentMethod?: string;
    customer: CreateOrderCustomerDto;
}
