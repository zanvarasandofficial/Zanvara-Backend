import type { Product } from '@prisma/client';
type OrderLineInput = {
    productId: string;
    name: string;
    quantity: number;
    price: number;
    deliveryOptionId?: string;
};
type EnrichedLine = OrderLineInput & {
    deliveryCharge: number;
    onlinePaymentPercent: number;
};
export type OrderPaymentRequirement = {
    onlinePaymentDue: number;
    balanceOnDelivery: number;
    mode: 'cod_ok' | 'partial_online' | 'full_online';
};
export declare function calculateOrderPaymentRequirement(lines: EnrichedLine[], total: number, qualifiesForFreeDelivery: boolean): OrderPaymentRequirement;
export declare function enrichLinesWithDeliveryPayment(items: OrderLineInput[], productMap: Map<string, Product>, qualifiesForFreeDelivery: boolean): {
    deliveryCharge: number;
    onlinePaymentPercent: number;
    productId: string;
    name: string;
    quantity: number;
    price: number;
    deliveryOptionId?: string;
}[];
export declare function validatePaymentForDeliveryRequirement(paymentMethod: string | undefined | null, requirement: OrderPaymentRequirement, countryCode: string | null): string;
export declare function resolveSubmittedPaymentMethod(paymentMethod: string | undefined | null, requirement: OrderPaymentRequirement): string;
export {};
