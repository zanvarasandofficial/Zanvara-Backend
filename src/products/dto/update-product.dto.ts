import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  detailsHtml?: string | null;

  @IsOptional()
  @IsString()
  specsHtml?: string | null;

  @IsOptional()
  @IsString()
  whatsIncludedHtml?: string | null;

  @IsOptional()
  @IsString()
  shippingReturnsHtml?: string | null;

  @IsOptional()
  @IsString()
  @MinLength(2)
  category?: string;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  originalPrice?: number;

  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsNumber()
  @Min(0.01)
  priceAfterDiscount?: number | null;

  @IsOptional()
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsNumber()
  @Min(0.01)
  originalPriceUsd?: number | null;

  @IsOptional()
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsNumber()
  @Min(0.01)
  priceAfterDiscountUsd?: number | null;

  @IsOptional()
  @IsString()
  badge?: string | null;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsUrl()
  hoverImageUrl?: string | null;

  @IsOptional()
  @IsString()
  imagePublicId?: string | null;

  @IsOptional()
  @IsString()
  hoverImagePublicId?: string | null;

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  galleryImageUrls?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  galleryImagePublicIds?: string[];

  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsIn(['PUBLISHED', 'DRAFT'])
  status?: 'PUBLISHED' | 'DRAFT';

  @IsOptional()
  @IsBoolean()
  isPopular?: boolean;

  @IsOptional()
  @IsIn(['FREE', 'CHARGED'])
  deliveryType?: 'FREE' | 'CHARGED';

  @ValidateIf((dto) => dto.deliveryType === 'CHARGED')
  @IsNumber()
  @Min(0.01)
  deliveryCharge?: number | null;

  @IsOptional()
  @IsBoolean()
  isComingSoon?: boolean;

  @ValidateIf((dto) => dto.isComingSoon === true)
  @IsDateString()
  availableAt?: string;

  @IsOptional()
  @IsBoolean()
  isPreOrder?: boolean;

  @ValidateIf((dto) => dto.isPreOrder === true)
  @IsInt()
  @Min(1)
  preOrderCapacity?: number;

  @ValidateIf((dto) => dto.isPreOrder === true)
  @IsOptional()
  @IsDateString()
  expectedShipAt?: string;

  @IsOptional()
  @IsString()
  expectedShipNote?: string | null;
}
