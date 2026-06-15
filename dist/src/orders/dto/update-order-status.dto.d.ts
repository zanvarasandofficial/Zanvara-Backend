declare const ORDER_STATUSES: readonly ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"];
export declare class UpdateOrderStatusDto {
    status: (typeof ORDER_STATUSES)[number];
}
export {};
