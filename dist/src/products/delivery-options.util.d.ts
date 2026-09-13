import type { Product } from '@prisma/client';
export type ProductDeliveryOption = {
    id: string;
    label: string;
    charge: number;
    chargeUsd: number | null;
    minDays: number;
    maxDays: number;
    isDefault: boolean;
    enabled: boolean;
    onlinePaymentPercent: number;
};
export declare function normalizeOnlinePaymentPercent(value: unknown): number;
export declare function normalizeDeliveryOptions(input: unknown[]): ProductDeliveryOption[];
export declare function resolveDeliveryOptionsFromProduct(product: Pick<Product, 'deliveryOptions' | 'deliveryType' | 'deliveryCharge'>): ProductDeliveryOption[];
export declare function getDefaultDeliveryOption(options: ProductDeliveryOption[]): ProductDeliveryOption;
export declare function getDeliveryOptionById(options: ProductDeliveryOption[], id?: string | null): ProductDeliveryOption | null;
export declare function deriveLegacyDeliveryFields(options: ProductDeliveryOption[]): {
    deliveryType: "CHARGED";
    deliveryCharge: number;
} | {
    deliveryType: "FREE";
    deliveryCharge: null;
};
export declare function resolveProductDeliveryInput(input: {
    deliveryOptions?: unknown[] | null;
    deliveryType?: string;
    deliveryCharge?: number | null;
}): {
    deliveryType: "CHARGED";
    deliveryCharge: number;
    deliveryOptions: ProductDeliveryOption[];
} | {
    deliveryType: "FREE";
    deliveryCharge: null;
    deliveryOptions: ProductDeliveryOption[];
};
export declare function formatDeliveryEta(minDays: number, maxDays: number): string;
