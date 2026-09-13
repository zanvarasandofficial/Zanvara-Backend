import { IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class UpdateOrderPaymentDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  onlinePaymentReceived?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  onlinePaymentNote?: string | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  balancePaymentReceived?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  balancePaymentNote?: string | null;
}
