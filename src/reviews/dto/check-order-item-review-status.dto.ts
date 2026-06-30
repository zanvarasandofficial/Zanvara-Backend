import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class OrderItemReviewCheckItemDto {
  @IsString()
  @MinLength(1)
  orderNumber!: string;

  @IsString()
  @MinLength(1)
  productId!: string;
}

export class CheckOrderItemReviewStatusDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemReviewCheckItemDto)
  items!: OrderItemReviewCheckItemDto[];
}
