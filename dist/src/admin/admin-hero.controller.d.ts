import { UpdateHeroDto } from '../settings/dto/update-hero.dto';
import { HeroService } from '../settings/hero.service';
export declare class AdminHeroController {
    private readonly heroService;
    constructor(heroService: HeroService);
    getHeroSettings(): Promise<{
        mediaType: "video" | "image";
        mediaUrl: string;
        updatedAt: Date;
    }>;
    updateHeroSettings(dto: UpdateHeroDto): Promise<{
        mediaType: "video" | "image";
        mediaUrl: string;
        updatedAt: Date;
    }>;
    uploadHeroMedia(file: Express.Multer.File): Promise<{
        mediaType: "video" | "image";
        mediaUrl: string;
        updatedAt: Date;
    }>;
}
