import { HeroService } from './hero.service';
export declare class HeroController {
    private readonly heroService;
    constructor(heroService: HeroService);
    getHeroSettings(): Promise<{
        mediaType: "video" | "image";
        mediaUrl: string;
        updatedAt: Date;
    }>;
}
