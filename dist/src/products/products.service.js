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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const cloudinary_service_1 = require("../cloudinary/cloudinary.service");
const prisma_service_1 = require("../prisma/prisma.service");
const product_mapper_1 = require("./product.mapper");
const ALLOWED_IMAGE_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/jpg',
]);
const PUBLISHED = 'PUBLISHED';
let ProductsService = class ProductsService {
    prisma;
    cloudinaryService;
    constructor(prisma, cloudinaryService) {
        this.prisma = prisma;
        this.cloudinaryService = cloudinaryService;
    }
    validatePricing(originalPrice, priceAfterDiscount) {
        if (originalPrice <= 0) {
            throw new common_1.BadRequestException('Original price must be greater than zero');
        }
        if (priceAfterDiscount == null) {
            return;
        }
        if (priceAfterDiscount <= 0) {
            throw new common_1.BadRequestException('Price after discount must be greater than zero');
        }
        if (priceAfterDiscount >= originalPrice) {
            throw new common_1.BadRequestException('Price after discount must be lower than original price');
        }
    }
    validateUsdPricing(originalPriceUsd, priceAfterDiscountUsd) {
        const hasOrig = originalPriceUsd != null;
        const hasAfter = priceAfterDiscountUsd != null;
        if (!hasOrig && !hasAfter) {
            return;
        }
        if (hasAfter && !hasOrig) {
            throw new common_1.BadRequestException('Original price (USD) is required when setting a USD sale price.');
        }
        if (hasOrig && originalPriceUsd <= 0) {
            throw new common_1.BadRequestException('Original price (USD) must be greater than zero');
        }
        if (!hasAfter) {
            return;
        }
        if (priceAfterDiscountUsd <= 0) {
            throw new common_1.BadRequestException('Price after discount (USD) must be greater than zero');
        }
        if (priceAfterDiscountUsd >= originalPriceUsd) {
            throw new common_1.BadRequestException('USD sale price must be lower than original USD price');
        }
    }
    normalizeUsdPricingFields(originalPriceUsd, priceAfterDiscountUsd) {
        return {
            originalPriceUsd: originalPriceUsd ?? null,
            priceAfterDiscountUsd: priceAfterDiscountUsd ?? null,
        };
    }
    validateDelivery(deliveryType, deliveryCharge) {
        if (deliveryType === 'CHARGED') {
            if (deliveryCharge == null || deliveryCharge <= 0) {
                throw new common_1.BadRequestException('Delivery charge is required when delivery is not free');
            }
        }
    }
    resolveDelivery(deliveryType, deliveryCharge) {
        const type = deliveryType === 'CHARGED' ? 'CHARGED' : 'FREE';
        return {
            deliveryType: type,
            deliveryCharge: type === 'CHARGED' ? deliveryCharge ?? null : null,
        };
    }
    resolveComingSoonForCreate(isComingSoon, availableAt) {
        const enabled = Boolean(isComingSoon);
        if (!enabled) {
            return { isComingSoon: false, availableAt: null };
        }
        if (!availableAt) {
            throw new common_1.BadRequestException('Launch date is required when coming soon is enabled.');
        }
        const date = new Date(availableAt);
        if (Number.isNaN(date.getTime())) {
            throw new common_1.BadRequestException('Invalid launch date.');
        }
        return { isComingSoon: true, availableAt: date };
    }
    resolveComingSoonForUpdate(dto, existing) {
        const enabled = dto.isComingSoon !== undefined ? dto.isComingSoon : existing.isComingSoon;
        if (!enabled) {
            return { isComingSoon: false, availableAt: null };
        }
        const raw = dto.availableAt !== undefined
            ? dto.availableAt
            : existing.availableAt?.toISOString();
        if (!raw) {
            throw new common_1.BadRequestException('Launch date is required when coming soon is enabled.');
        }
        const date = new Date(raw);
        if (Number.isNaN(date.getTime())) {
            throw new common_1.BadRequestException('Invalid launch date.');
        }
        return { isComingSoon: true, availableAt: date };
    }
    resolvePreOrderFields(isPreOrder, preOrderCapacity, expectedShipAt, expectedShipNote) {
        if (!isPreOrder) {
            return {
                isPreOrder: false,
                preOrderCapacity: null,
                expectedShipAt: null,
                expectedShipNote: null,
            };
        }
        if (!preOrderCapacity || preOrderCapacity < 1) {
            throw new common_1.BadRequestException('Pre-order capacity is required (minimum 1 unit).');
        }
        let shipAt = null;
        if (expectedShipAt) {
            shipAt = new Date(expectedShipAt);
            if (Number.isNaN(shipAt.getTime())) {
                throw new common_1.BadRequestException('Invalid expected ship date.');
            }
        }
        const note = expectedShipNote?.trim() || null;
        if (!shipAt && !note) {
            throw new common_1.BadRequestException('Add an expected ship date or note for pre-order products.');
        }
        return {
            isPreOrder: true,
            preOrderCapacity,
            expectedShipAt: shipAt,
            expectedShipNote: note,
        };
    }
    resolveFulfillmentForCreate(dto) {
        if (dto.isComingSoon) {
            const comingSoon = this.resolveComingSoonForCreate(true, dto.availableAt);
            return {
                ...comingSoon,
                ...this.resolvePreOrderFields(false),
            };
        }
        if (dto.isPreOrder) {
            return {
                isComingSoon: false,
                availableAt: null,
                ...this.resolvePreOrderFields(true, dto.preOrderCapacity, dto.expectedShipAt, dto.expectedShipNote),
            };
        }
        return {
            isComingSoon: false,
            availableAt: null,
            ...this.resolvePreOrderFields(false),
        };
    }
    resolveFulfillmentForUpdate(dto, existing) {
        const nextComingSoon = dto.isComingSoon !== undefined ? dto.isComingSoon : existing.isComingSoon;
        const nextPreOrder = dto.isPreOrder !== undefined ? dto.isPreOrder : existing.isPreOrder;
        if (nextComingSoon && nextPreOrder) {
            throw new common_1.BadRequestException('A product cannot be both coming soon and pre-order.');
        }
        if (nextComingSoon) {
            const comingSoon = this.resolveComingSoonForUpdate({ isComingSoon: true, availableAt: dto.availableAt }, existing);
            return {
                ...comingSoon,
                ...this.resolvePreOrderFields(false),
            };
        }
        if (nextPreOrder) {
            const capacity = dto.preOrderCapacity !== undefined
                ? dto.preOrderCapacity
                : existing.preOrderCapacity ?? undefined;
            const expectedShipAt = dto.expectedShipAt !== undefined
                ? dto.expectedShipAt
                : existing.expectedShipAt?.toISOString();
            const expectedShipNote = dto.expectedShipNote !== undefined
                ? dto.expectedShipNote
                : existing.expectedShipNote;
            return {
                isComingSoon: false,
                availableAt: null,
                ...this.resolvePreOrderFields(true, capacity, expectedShipAt, expectedShipNote),
            };
        }
        return {
            isComingSoon: false,
            availableAt: null,
            ...this.resolvePreOrderFields(false),
        };
    }
    async createUniqueSlug(name, excludeId) {
        const baseSlug = (0, product_mapper_1.slugifyName)(name) || 'product';
        let slug = baseSlug;
        let suffix = 1;
        while (true) {
            const existing = await this.prisma.product.findUnique({
                where: { slug },
            });
            if (!existing || existing.id === excludeId) {
                return slug;
            }
            suffix += 1;
            slug = `${baseSlug}-${suffix}`;
        }
    }
    async uploadProductImage(file) {
        if (!file) {
            throw new common_1.BadRequestException('Image file is required');
        }
        if (!ALLOWED_IMAGE_TYPES.has(file.mimetype)) {
            throw new common_1.BadRequestException('Only JPG, PNG, or WEBP images are allowed');
        }
        const result = await this.cloudinaryService.uploadProductImage(file);
        return {
            url: result.secure_url,
            publicId: result.public_id,
        };
    }
    async findAllAdmin() {
        const products = await this.prisma.product.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return products.map((product) => this.toAdminProduct(product));
    }
    async findOneAdmin(id) {
        const product = await this.prisma.product.findUnique({ where: { id } });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        return this.toAdminProduct(product);
    }
    async createProduct(dto) {
        this.validatePricing(dto.originalPrice, dto.priceAfterDiscount);
        this.validateUsdPricing(dto.originalPriceUsd, dto.priceAfterDiscountUsd);
        this.validateDelivery(dto.deliveryType, dto.deliveryCharge);
        const delivery = this.resolveDelivery(dto.deliveryType, dto.deliveryCharge);
        const fulfillment = this.resolveFulfillmentForCreate(dto);
        const slug = await this.createUniqueSlug(dto.name);
        const usdPricing = this.normalizeUsdPricingFields(dto.originalPriceUsd, dto.priceAfterDiscountUsd);
        try {
            const product = await this.prisma.product.create({
                data: {
                    name: dto.name,
                    slug,
                    description: dto.description,
                    detailsHtml: (0, product_mapper_1.normalizeDetailsHtml)(dto.detailsHtml),
                    specsHtml: (0, product_mapper_1.normalizeDetailsHtml)(dto.specsHtml),
                    whatsIncludedHtml: (0, product_mapper_1.normalizeDetailsHtml)(dto.whatsIncludedHtml),
                    shippingReturnsHtml: (0, product_mapper_1.normalizeDetailsHtml)(dto.shippingReturnsHtml),
                    category: dto.category,
                    originalPrice: dto.originalPrice,
                    priceAfterDiscount: dto.priceAfterDiscount ?? null,
                    originalPriceUsd: usdPricing.originalPriceUsd,
                    priceAfterDiscountUsd: usdPricing.priceAfterDiscountUsd,
                    badge: (0, product_mapper_1.normalizeBadge)(dto.badge),
                    imageUrl: dto.imageUrl,
                    hoverImageUrl: dto.hoverImageUrl || null,
                    imagePublicId: dto.imagePublicId || null,
                    hoverImagePublicId: dto.hoverImagePublicId || null,
                    galleryImageUrls: dto.galleryImageUrls ?? [],
                    galleryImagePublicIds: dto.galleryImagePublicIds ?? [],
                    stock: dto.stock,
                    status: dto.status,
                    isPopular: dto.isPopular,
                    deliveryType: delivery.deliveryType,
                    deliveryCharge: delivery.deliveryCharge,
                    isComingSoon: fulfillment.isComingSoon,
                    availableAt: fulfillment.availableAt,
                    isPreOrder: fulfillment.isPreOrder,
                    preOrderCapacity: fulfillment.preOrderCapacity,
                    expectedShipAt: fulfillment.expectedShipAt,
                    expectedShipNote: fulfillment.expectedShipNote,
                },
            });
            return this.toAdminProduct(product);
        }
        catch (error) {
            if (typeof error === 'object' &&
                error !== null &&
                'code' in error &&
                error.code === 'P2002') {
                throw new common_1.ConflictException('Product slug already exists');
            }
            throw error;
        }
    }
    async updateProduct(id, dto) {
        const existing = await this.prisma.product.findUnique({ where: { id } });
        if (!existing) {
            throw new common_1.NotFoundException('Product not found');
        }
        const originalPrice = dto.originalPrice ?? existing.originalPrice;
        const priceAfterDiscount = dto.priceAfterDiscount !== undefined
            ? dto.priceAfterDiscount
            : existing.priceAfterDiscount;
        this.validatePricing(originalPrice, priceAfterDiscount);
        const originalPriceUsd = dto.originalPriceUsd !== undefined
            ? dto.originalPriceUsd
            : existing.originalPriceUsd;
        const priceAfterDiscountUsd = dto.priceAfterDiscountUsd !== undefined
            ? dto.priceAfterDiscountUsd
            : existing.priceAfterDiscountUsd;
        this.validateUsdPricing(originalPriceUsd, priceAfterDiscountUsd);
        const nextDeliveryType = dto.deliveryType ?? existing.deliveryType ?? 'FREE';
        const nextDeliveryCharge = dto.deliveryCharge !== undefined
            ? dto.deliveryCharge
            : existing.deliveryCharge;
        this.validateDelivery(nextDeliveryType, nextDeliveryCharge);
        const delivery = this.resolveDelivery(nextDeliveryType, nextDeliveryCharge);
        const fulfillment = this.resolveFulfillmentForUpdate(dto, existing);
        if (fulfillment.isPreOrder &&
            fulfillment.preOrderCapacity != null &&
            fulfillment.preOrderCapacity < (existing.preOrderReserved ?? 0)) {
            throw new common_1.BadRequestException(`Pre-order capacity cannot be lower than ${existing.preOrderReserved} already reserved.`);
        }
        const slug = dto.name && dto.name !== existing.name
            ? await this.createUniqueSlug(dto.name, id)
            : existing.slug;
        const product = await this.prisma.product.update({
            where: { id },
            data: {
                name: dto.name ?? existing.name,
                slug,
                description: dto.description !== undefined ? dto.description : existing.description,
                detailsHtml: dto.detailsHtml !== undefined
                    ? (0, product_mapper_1.normalizeDetailsHtml)(dto.detailsHtml)
                    : existing.detailsHtml,
                specsHtml: dto.specsHtml !== undefined
                    ? (0, product_mapper_1.normalizeDetailsHtml)(dto.specsHtml)
                    : existing.specsHtml,
                whatsIncludedHtml: dto.whatsIncludedHtml !== undefined
                    ? (0, product_mapper_1.normalizeDetailsHtml)(dto.whatsIncludedHtml)
                    : existing.whatsIncludedHtml,
                shippingReturnsHtml: dto.shippingReturnsHtml !== undefined
                    ? (0, product_mapper_1.normalizeDetailsHtml)(dto.shippingReturnsHtml)
                    : existing.shippingReturnsHtml,
                category: dto.category ?? existing.category,
                originalPrice,
                priceAfterDiscount,
                originalPriceUsd: dto.originalPriceUsd !== undefined
                    ? dto.originalPriceUsd
                    : existing.originalPriceUsd,
                priceAfterDiscountUsd: dto.priceAfterDiscountUsd !== undefined
                    ? dto.priceAfterDiscountUsd
                    : existing.priceAfterDiscountUsd,
                badge: dto.badge !== undefined
                    ? (0, product_mapper_1.normalizeBadge)(dto.badge)
                    : existing.badge,
                imageUrl: dto.imageUrl ?? existing.imageUrl,
                hoverImageUrl: dto.hoverImageUrl !== undefined
                    ? dto.hoverImageUrl
                    : existing.hoverImageUrl,
                imagePublicId: dto.imagePublicId !== undefined
                    ? dto.imagePublicId
                    : existing.imagePublicId,
                hoverImagePublicId: dto.hoverImagePublicId !== undefined
                    ? dto.hoverImagePublicId
                    : existing.hoverImagePublicId,
                galleryImageUrls: dto.galleryImageUrls !== undefined
                    ? dto.galleryImageUrls
                    : existing.galleryImageUrls,
                galleryImagePublicIds: dto.galleryImagePublicIds !== undefined
                    ? dto.galleryImagePublicIds
                    : existing.galleryImagePublicIds,
                stock: dto.stock ?? existing.stock,
                status: dto.status ?? existing.status,
                isPopular: dto.isPopular ?? existing.isPopular,
                deliveryType: delivery.deliveryType,
                deliveryCharge: delivery.deliveryCharge,
                isComingSoon: fulfillment.isComingSoon,
                availableAt: fulfillment.availableAt,
                isPreOrder: fulfillment.isPreOrder,
                preOrderCapacity: fulfillment.preOrderCapacity,
                expectedShipAt: fulfillment.expectedShipAt,
                expectedShipNote: fulfillment.expectedShipNote,
            },
        });
        return this.toAdminProduct(product);
    }
    async deleteProduct(id) {
        const existing = await this.prisma.product.findUnique({ where: { id } });
        if (!existing) {
            throw new common_1.NotFoundException('Product not found');
        }
        await this.prisma.product.delete({ where: { id } });
        return { message: 'Product deleted successfully' };
    }
    async getLandingProducts() {
        const published = await this.prisma.product.findMany({
            where: { status: PUBLISHED },
            orderBy: { createdAt: 'desc' },
        });
        const popular = published
            .filter((product) => product.isPopular)
            .slice(0, 12)
            .map(product_mapper_1.mapProductToPublic);
        const latest = published.slice(0, 12).map(product_mapper_1.mapProductToPublic);
        const bestDeals = published
            .filter((product) => (0, product_mapper_1.hasProductDiscount)(product))
            .sort((left, right) => ((0, product_mapper_1.getDiscountPercent)(right) ?? 0) - ((0, product_mapper_1.getDiscountPercent)(left) ?? 0))
            .slice(0, 12)
            .map(product_mapper_1.mapProductToPublic);
        return { popular, latest, bestDeals };
    }
    async findAllPublished() {
        const products = await this.prisma.product.findMany({
            where: { status: PUBLISHED },
            orderBy: { createdAt: 'desc' },
        });
        return products.map(product_mapper_1.mapProductToPublic);
    }
    async findPublishedById(id) {
        const product = await this.prisma.product.findFirst({
            where: { id, status: PUBLISHED },
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        return (0, product_mapper_1.mapProductToPublic)(product);
    }
    toAdminProduct(product) {
        const discountPercent = (0, product_mapper_1.getDiscountPercent)(product);
        return {
            id: product.id,
            name: product.name,
            slug: product.slug,
            description: product.description,
            detailsHtml: (0, product_mapper_1.normalizeDetailsHtml)(product.detailsHtml),
            specsHtml: (0, product_mapper_1.normalizeDetailsHtml)(product.specsHtml),
            whatsIncludedHtml: (0, product_mapper_1.normalizeDetailsHtml)(product.whatsIncludedHtml),
            shippingReturnsHtml: (0, product_mapper_1.normalizeDetailsHtml)(product.shippingReturnsHtml),
            category: product.category,
            originalPrice: product.originalPrice,
            priceAfterDiscount: product.priceAfterDiscount,
            originalPriceUsd: product.originalPriceUsd,
            priceAfterDiscountUsd: product.priceAfterDiscountUsd,
            price: (0, product_mapper_1.mapProductToPublic)(product).price,
            discountPercent,
            badge: (0, product_mapper_1.normalizeBadge)(product.badge),
            imageUrl: product.imageUrl,
            hoverImageUrl: product.hoverImageUrl,
            imagePublicId: product.imagePublicId,
            hoverImagePublicId: product.hoverImagePublicId,
            galleryImageUrls: product.galleryImageUrls ?? [],
            galleryImagePublicIds: product.galleryImagePublicIds ?? [],
            stock: product.stock,
            status: product.status,
            isPopular: product.isPopular,
            deliveryType: product.deliveryType ?? 'FREE',
            deliveryCharge: product.deliveryCharge,
            isComingSoon: product.isComingSoon,
            availableAt: product.availableAt,
            isPreOrder: product.isPreOrder,
            preOrderCapacity: product.preOrderCapacity,
            preOrderReserved: product.preOrderReserved ?? 0,
            expectedShipAt: product.expectedShipAt,
            expectedShipNote: product.expectedShipNote,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
        };
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cloudinary_service_1.CloudinaryService])
], ProductsService);
//# sourceMappingURL=products.service.js.map