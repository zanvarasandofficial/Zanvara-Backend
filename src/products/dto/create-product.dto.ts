import {
  IsArray,
  IsBoolean,
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

  @IsIn(['FREE', 'CHARGED'])
  deliveryType!: 'FREE' | 'CHARGED';

  @ValidateIf((dto) => dto.deliveryType === 'CHARGED')
  @IsNumber()
  @Min(0.01)
  deliveryCharge?: number | null;
}
