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
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const cloudinary_service_1 = require("../cloudinary/cloudinary.service");
const prisma_service_1 = require("../prisma/prisma.service");
const PUBLISHED = 'PUBLISHED';
const ALLOWED_IMAGE_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/jpg',
]);
const DEFAULT_CATEGORIES = [
    {
        name: 'KINETIC SAND TABLES',
        sortOrder: 0,
        imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
    },
    {
        name: 'ARTISAN SAND',
        sortOrder: 1,
        imageUrl: 'https://images.unsplash.com/photo-1509316785289-025f5b846503?auto=format&fit=crop&w=800&q=80',
    },
    {
        name: 'MAGNETIC SPHERES',
        sortOrder: 2,
        imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    },
];
function slugifyName(value) {
    return value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}
function formatItemCount(count) {
    if (count === 1) {
        return '1 item';
    }
    return `${count} items`;
}
let CategoriesService = class CategoriesService {
    prisma;
    cloudinaryService;
    syncInFlight = null;
    constructor(prisma, cloudinaryService) {
        this.prisma = prisma;
        this.cloudinaryService = cloudinaryService;
    }
    async onModuleInit() {
        try {
            await this.syncStoreCategories();
        }
        catch {
        }
    }
    async ensureDefaultCategories() {
        await this.syncStoreCategories();
    }
    async syncStoreCategories() {
        if (!this.syncInFlight) {
            this.syncInFlight = this.runStoreCategorySync().finally(() => {
                this.syncInFlight = null;
            });
        }
        await this.syncInFlight;
    }
    async runStoreCategorySync() {
        const canonicalNames = DEFAULT_CATEGORIES.map((category) => category.name);
        for (let attempt = 0; attempt < 3; attempt += 1) {
            try {
                for (const category of DEFAULT_CATEGORIES) {
                    const slug = slugifyName(category.name);
                    if (!slug) {
                        continue;
                    }
                    await this.prisma.storeCategory.upsert({
                        where: { slug },
                        create: {
                            name: category.name,
                            slug,
                            imageUrl: category.imageUrl,
                            sortOrder: category.sortOrder,
                            isActive: true,
                        },
                        update: {
                            name: category.name,
                            sortOrder: category.sortOrder,
                            isActive: true,
                        },
                    });
                }
                await this.prisma.storeCategory.deleteMany({
                    where: {
                        name: { notIn: canonicalNames },
                    },
                });
                return;
            }
            catch (error) {
                if (attempt === 2) {
                    throw error;
                }
                await new Promise((resolve) => setTimeout(resolve, 400 * (attempt + 1)));
            }
        }
    }
    async getProductCountsByName() {
        const products = await this.prisma.product.findMany({
            where: { status: PUBLISHED },
            select: { category: true },
        });
        const counts = new Map();
        for (const product of products) {
            const key = product.category.trim();
            counts.set(key, (counts.get(key) ?? 0) + 1);
        }
        return counts;
    }
    mapPublicCategory(category, productCount) {
        return {
            id: category.id,
            name: category.name,
            slug: category.slug,
            image: category.imageUrl,
            count: formatItemCount(productCount),
            productCount,
        };
    }
    mapAdminCategory(category, productCount) {
        return {
            id: category.id,
            name: category.name,
            slug: category.slug,
            imageUrl: category.imageUrl,
            imagePublicId: category.imagePublicId,
            sortOrder: category.sortOrder,
            isActive: category.isActive,
            productCount,
            status: category.isActive ? 'Active' : 'Hidden',
            createdAt: category.createdAt,
            updatedAt: category.updatedAt,
        };
    }
    async listPublicCategories() {
        await this.ensureDefaultCategories();
        const [categories, productCounts] = await Promise.all([
            this.prisma.storeCategory.findMany({
                where: { isActive: true },
                orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
            }),
            this.getProductCountsByName(),
        ]);
        return categories.map((category) => this.mapPublicCategory(category, productCounts.get(category.name) ?? 0));
    }
    async listAdminCategories() {
        await this.ensureDefaultCategories();
        const [categories, productCounts] = await Promise.all([
            this.prisma.storeCategory.findMany({
                orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
            }),
            this.getProductCountsByName(),
        ]);
        return categories.map((category) => this.mapAdminCategory(category, productCounts.get(category.name) ?? 0));
    }
    async listCategoryNames() {
        await this.ensureDefaultCategories();
        const categories = await this.prisma.storeCategory.findMany({
            where: { isActive: true },
            orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
            select: { name: true },
        });
        return categories.map((category) => category.name);
    }
    async findCategoryOrThrow(id) {
        const category = await this.prisma.storeCategory.findUnique({
            where: { id },
        });
        if (!category) {
            throw new common_1.NotFoundException('Category not found');
        }
        return category;
    }
    async createCategory(dto) {
        const name = dto.name.trim();
        const slug = slugifyName(name);
        if (!slug) {
            throw new common_1.BadRequestException('Category name is invalid');
        }
        const existing = await this.prisma.storeCategory.findFirst({
            where: {
                OR: [{ name }, { slug }],
            },
        });
        if (existing) {
            throw new common_1.ConflictException('Category already exists');
        }
        const lastCategory = await this.prisma.storeCategory.findFirst({
            orderBy: { sortOrder: 'desc' },
            select: { sortOrder: true },
        });
        const category = await this.prisma.storeCategory.create({
            data: {
                name,
                slug,
                imageUrl: dto.imageUrl?.trim() ?? '',
                imagePublicId: dto.imagePublicId,
                sortOrder: dto.sortOrder ?? (lastCategory?.sortOrder ?? -1) + 1,
                isActive: dto.isActive ?? true,
            },
        });
        return this.mapAdminCategory(category, 0);
    }
    async updateCategory(id, dto) {
        const category = await this.findCategoryOrThrow(id);
        const data = {};
        if (dto.name !== undefined) {
            const nextName = dto.name.trim();
            const slug = slugifyName(nextName);
            if (!slug) {
                throw new common_1.BadRequestException('Category name is invalid');
            }
            if (nextName !== category.name) {
                const existing = await this.prisma.storeCategory.findFirst({
                    where: {
                        OR: [{ name: nextName }, { slug }],
                        NOT: { id },
                    },
                });
                if (existing) {
                    throw new common_1.ConflictException('Category name already exists');
                }
            }
            data.name = nextName;
            data.slug = slug;
        }
        if (dto.imageUrl !== undefined) {
            data.imageUrl = dto.imageUrl.trim();
        }
        if (dto.imagePublicId !== undefined) {
            data.imagePublicId = dto.imagePublicId;
        }
        if (dto.sortOrder !== undefined) {
            data.sortOrder = dto.sortOrder;
        }
        if (dto.isActive !== undefined) {
            data.isActive = dto.isActive;
        }
        const updated = await this.prisma.storeCategory.update({
            where: { id },
            data,
        });
        const productCounts = await this.getProductCountsByName();
        return this.mapAdminCategory(updated, productCounts.get(updated.name) ?? 0);
    }
    async deleteCategory(id) {
        const category = await this.findCategoryOrThrow(id);
        const productCount = await this.prisma.product.count({
            where: {
                category: category.name,
                status: PUBLISHED,
            },
        });
        if (productCount > 0) {
            throw new common_1.BadRequestException('Cannot delete a category that still has published products');
        }
        await this.prisma.storeCategory.delete({ where: { id } });
        return { success: true };
    }
    async uploadCategoryImage(id, file) {
        if (!file) {
            throw new common_1.BadRequestException('Image file is required');
        }
        if (!ALLOWED_IMAGE_TYPES.has(file.mimetype)) {
            throw new common_1.BadRequestException('Only JPG, PNG, or WEBP files are allowed');
        }
        const category = await this.findCategoryOrThrow(id);
        const result = await this.cloudinaryService.uploadCategoryImage(file);
        return this.updateCategory(id, {
            imageUrl: result.secure_url,
            imagePublicId: result.public_id,
        });
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cloudinary_service_1.CloudinaryService])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map