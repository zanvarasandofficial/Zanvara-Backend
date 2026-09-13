import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class ProductDeliveryOptionDto {
  @IsString()
  @MinLength(1)
  id!: string;

  @IsString()
  @MinLength(1)
  label!: string;

  @IsNumber()
  @Min(0)
  charge!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  chargeUsd?: number | null;

  @IsInt()
  @Min(0)
  minDays!: number;

  @IsInt()
  @Min(0)
  maxDays!: number;

  @IsBoolean()
  isDefault!: boolean;

  @IsBoolean()
  enabled!: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  onlinePaymentPercent?: number;
}
