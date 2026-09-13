export declare function roundOrderMoney(value: number): number;
export declare function getRequiredOnlinePercent(onlinePaymentDue: number, total: number): number;
export declare function getPaymentRemaining(due: number, received: number): number;
export type PaymentCollectionStatus = 'not_required' | 'pending' | 'partial' | 'received';
export declare function getPaymentCollectionStatus(due: number, received: number): PaymentCollectionStatus;
export declare function getLineOnlineAdvanceAmount(item: {
    price: number;
    quantity: number;
    deliveryCharge?: number;
    onlinePaymentPercent?: number;
}): number;
export declare const getOnlinePaymentRemaining: typeof getPaymentRemaining;
export declare const getOnlinePaymentCollectionStatus: typeof getPaymentCollectionStatus;
export type OnlinePaymentCollectionStatus = PaymentCollectionStatus;
