import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class UpdateStoreSettingsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  freeDeliveryMinTableQuantity?: number;

  /** PKR per 1 USD (e.g. 278 means $1 ≈ Rs 278) */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(2000)
  pkrToUsdRate?: number;
}
