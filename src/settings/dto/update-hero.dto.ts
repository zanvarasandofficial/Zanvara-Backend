import { IsIn, IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateHeroDto {
  @IsIn(['video', 'image'])
  mediaType!: 'video' | 'image';

  @IsUrl()
  mediaUrl!: string;

  @IsOptional()
  @IsString()
  cloudinaryPublicId?: string;
}
