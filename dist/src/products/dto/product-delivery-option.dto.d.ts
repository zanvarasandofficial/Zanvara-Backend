export declare class ProductDeliveryOptionDto {
    id: string;
    label: string;
    charge: number;
    chargeUsd?: number | null;
    minDays: number;
    maxDays: number;
    isDefault: boolean;
    enabled: boolean;
    onlinePaymentPercent?: number;
}
