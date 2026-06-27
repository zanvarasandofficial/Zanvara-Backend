declare const ORDER_STATUSES: readonly ["pending", "confirmed", "shipped", "delivered", "cancelled"];
export declare class UpdateOrderStatusDto {
    status: (typeof ORDER_STATUSES)[number];
}
export {};
