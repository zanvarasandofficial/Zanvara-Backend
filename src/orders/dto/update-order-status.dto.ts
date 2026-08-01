import { IsIn, IsString } from 'class-validator';

const ORDER_STATUSES = [
  'pending',
  'pre_order_confirmed',
  'in_production',
  'ready_to_ship',
  'confirmed',
  'shipped',
  'delivered',
  'cancelled',
] as const;

export class UpdateOrderStatusDto {
  @IsString()
  @IsIn(ORDER_STATUSES)
  status!: (typeof ORDER_STATUSES)[number];
}

export { ORDER_STATUSES };
