import { BadRequestException, Injectable } from '@nestjs/common';
import { HeroSetting } from '@prisma/client';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateHeroDto } from './dto/update-hero.dto';

const HERO_ID = 'hero';

const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/jpg',
]);

const ALLOWED_VIDEO_TYPES = new Set([
  'video/mp4',
  'video/webm',
  'video/quicktime',
]);

@Injectable()
export class HeroService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async getHeroSettings(): Promise<HeroSetting> {
    const existing = await this.prisma.heroSetting.findUnique({
      where: { id: HERO_ID },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.heroSetting.create({
      data: {
        id: HERO_ID,
        mediaType: 'video',
        mediaUrl: '',
      },
    });
  }

  toPublicHero(hero: HeroSetting) {
    return {
      mediaType: hero.mediaType as 'video' | 'image',
      mediaUrl: hero.mediaUrl,
      updatedAt: hero.updatedAt,
    };
  }

  async updateHeroSettings(dto: UpdateHeroDto) {
    const hero = await this.prisma.heroSetting.upsert({
      where: { id: HERO_ID },
      create: {
        id: HERO_ID,
        mediaType: dto.mediaType,
        mediaUrl: dto.mediaUrl,
        cloudinaryPublicId: dto.cloudinaryPublicId,
      },
      update: {
        mediaType: dto.mediaType,
        mediaUrl: dto.mediaUrl,
        cloudinaryPublicId: dto.cloudinaryPublicId,
      },
    });

    return this.toPublicHero(hero);
  }

  async uploadHeroMedia(file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Media file is required');
    }

    const isImage = ALLOWED_IMAGE_TYPES.has(file.mimetype);
    const isVideo = ALLOWED_VIDEO_TYPES.has(file.mimetype);

    if (!isImage && !isVideo) {
      throw new BadRequestException(
        'Only JPG, PNG, WEBP, MP4, WEBM, or MOV files are allowed',
      );
    }

    const result = await this.cloudinaryService.uploadHeroMedia(file);
    const mediaType = result.resource_type === 'video' ? 'video' : 'image';

    return this.updateHeroSettings({
      mediaType,
      mediaUrl: result.secure_url,
      cloudinaryPublicId: result.public_id,
    });
  }
}
