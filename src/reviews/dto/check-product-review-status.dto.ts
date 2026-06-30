import { ArrayMinSize, IsArray, IsString } from 'class-validator';

export class CheckProductReviewStatusDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  productIds!: string[];
}
