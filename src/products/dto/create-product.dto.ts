import { Type } from 'class-transformer';
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
  ValidateNested,
} from 'class-validator';
import { ProductDeliveryOptionDto } from './product-delivery-option.dto';

export class CreateProductDto {
  @IsString()
  @MinLength(2)
  name!: string;

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

  @IsString()
  @MinLength(2)
  category!: string;

  @IsNumber()
  @Min(0.01)
  originalPrice!: number;

  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsNumber()
  @Min(0.01)
  priceAfterDiscount?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  originalPriceUsd?: number | null;

  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  priceAfterDiscountUsd?: number | null;

  @IsOptional()
  @IsString()
  badge?: string;

  @IsUrl()
  imageUrl!: string;

  @IsOptional()
  @IsUrl()
  hoverImageUrl?: string;

  @IsOptional()
  @IsString()
  imagePublicId?: string;

  @IsOptional()
  @IsString()
  hoverImagePublicId?: string;

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  galleryImageUrls?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  galleryImagePublicIds?: string[];

  @IsInt()
  @Min(0)
  stock!: number;

  @IsIn(['PUBLISHED', 'DRAFT'])
  status!: 'PUBLISHED' | 'DRAFT';

  @IsBoolean()
  isPopular!: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductDeliveryOptionDto)
  deliveryOptions?: ProductDeliveryOptionDto[];

  @ValidateIf((dto) => !dto.deliveryOptions?.length)
  @IsIn(['FREE', 'CHARGED'])
  deliveryType?: 'FREE' | 'CHARGED';

  @ValidateIf((dto) => !dto.deliveryOptions?.length && dto.deliveryType === 'CHARGED')
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
