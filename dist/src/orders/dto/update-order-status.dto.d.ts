declare const ORDER_STATUSES: readonly ["pending", "pre_order_confirmed", "in_production", "ready_to_ship", "confirmed", "shipped", "delivered", "cancelled"];
export declare class UpdateOrderStatusDto {
    status: (typeof ORDER_STATUSES)[number];
}
export { ORDER_STATUSES };
