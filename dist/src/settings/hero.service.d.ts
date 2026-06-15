import { HeroSetting } from '@prisma/client';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateHeroDto } from './dto/update-hero.dto';
export declare class HeroService {
    private readonly prisma;
    private readonly cloudinaryService;
    constructor(prisma: PrismaService, cloudinaryService: CloudinaryService);
    getHeroSettings(): Promise<HeroSetting>;
    toPublicHero(hero: HeroSetting): {
        mediaType: "video" | "image";
        mediaUrl: string;
        updatedAt: Date;
    };
    updateHeroSettings(dto: UpdateHeroDto): Promise<{
        mediaType: "video" | "image";
        mediaUrl: string;
        updatedAt: Date;
    }>;
    uploadHeroMedia(file?: Express.Multer.File): Promise<{
        mediaType: "video" | "image";
        mediaUrl: string;
        updatedAt: Date;
    }>;
}
