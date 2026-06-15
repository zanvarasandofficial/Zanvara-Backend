"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeroService = void 0;
const common_1 = require("@nestjs/common");
const cloudinary_service_1 = require("../cloudinary/cloudinary.service");
const prisma_service_1 = require("../prisma/prisma.service");
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
let HeroService = class HeroService {
    prisma;
    cloudinaryService;
    constructor(prisma, cloudinaryService) {
        this.prisma = prisma;
        this.cloudinaryService = cloudinaryService;
    }
    async getHeroSettings() {
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
    toPublicHero(hero) {
        return {
            mediaType: hero.mediaType,
            mediaUrl: hero.mediaUrl,
            updatedAt: hero.updatedAt,
        };
    }
    async updateHeroSettings(dto) {
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
    async uploadHeroMedia(file) {
        if (!file) {
            throw new common_1.BadRequestException('Media file is required');
        }
        const isImage = ALLOWED_IMAGE_TYPES.has(file.mimetype);
        const isVideo = ALLOWED_VIDEO_TYPES.has(file.mimetype);
        if (!isImage && !isVideo) {
            throw new common_1.BadRequestException('Only JPG, PNG, WEBP, MP4, WEBM, or MOV files are allowed');
        }
        const result = await this.cloudinaryService.uploadHeroMedia(file);
        const mediaType = result.resource_type === 'video' ? 'video' : 'image';
        return this.updateHeroSettings({
            mediaType,
            mediaUrl: result.secure_url,
            cloudinaryPublicId: result.public_id,
        });
    }
};
exports.HeroService = HeroService;
exports.HeroService = HeroService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cloudinary_service_1.CloudinaryService])
], HeroService);
//# sourceMappingURL=hero.service.js.map