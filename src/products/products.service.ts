import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Product } from '@prisma/client';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  getDiscountPercent,
  hasProductDiscount,
  mapProductToPublic,
  normalizeBadge,
  normalizeDetailsHtml,
  slugifyName,
} from './product.mapper';

const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/jpg',
]);

const PUBLISHED = 'PUBLISHED';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  private validatePricing(
    originalPrice: number,
    priceAfterDiscount?: number | null,
  ) {
    if (originalPrice <= 0) {
      throw new BadRequestException('Original price must be greater than zero');
    }

    if (priceAfterDiscount == null) {
      return;
    }

    if (priceAfterDiscount <= 0) {
      throw new BadRequestException(
        'Price after discount must be greater than zero',
      );
    }

    if (priceAfterDiscount >= originalPrice) {
      throw new BadRequestException(
        'Price after discount must be lower than original price',
      );
    }
  }

  private validateDelivery(
    deliveryType: string,
    deliveryCharge?: number | null,
  ) {
    if (deliveryType === 'CHARGED') {
      if (deliveryCharge == null || deliveryCharge <= 0) {
        throw new BadRequestException(
          'Delivery charge is required when delivery is not free',
        );
      }
    }
  }

  private resolveDelivery(
    deliveryType?: string,
    deliveryCharge?: number | null,
  ) {
    const type = deliveryType === 'CHARGED' ? 'CHARGED' : 'FREE';

    return {
      deliveryType: type,
      deliveryCharge: type === 'CHARGED' ? deliveryCharge ?? null : null,
    };
  }

  private async createUniqueSlug(name: string, excludeId?: string) {
    const baseSlug = slugifyName(name) || 'product';
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

  async uploadProductImage(file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    if (!ALLOWED_IMAGE_TYPES.has(file.mimetype)) {
      throw new BadRequestException('Only JPG, PNG, or WEBP images are allowed');
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

  async findOneAdmin(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.toAdminProduct(product);
  }

  async createProduct(dto: CreateProductDto) {
    this.validatePricing(dto.originalPrice, dto.priceAfterDiscount);
    this.validateDelivery(dto.deliveryType, dto.deliveryCharge);

    const delivery = this.resolveDelivery(dto.deliveryType, dto.deliveryCharge);
    const slug = await this.createUniqueSlug(dto.name);

    try {
      const product = await this.prisma.product.create({
        data: {
          name: dto.name,
          slug,
          description: dto.description,
          detailsHtml: normalizeDetailsHtml(dto.detailsHtml),
          category: dto.category,
          originalPrice: dto.originalPrice,
          priceAfterDiscount: dto.priceAfterDiscount ?? null,
          badge: normalizeBadge(dto.badge),
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
        },
      });

      return this.toAdminProduct(product);
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Product slug already exists');
      }

      throw error;
    }
  }

  async updateProduct(id: string, dto: UpdateProductDto) {
    const existing = await this.prisma.product.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException('Product not found');
    }

    const originalPrice = dto.originalPrice ?? existing.originalPrice;
    const priceAfterDiscount =
      dto.priceAfterDiscount !== undefined
        ? dto.priceAfterDiscount
        : existing.priceAfterDiscount;

    this.validatePricing(originalPrice, priceAfterDiscount);

    const nextDeliveryType =
      dto.deliveryType ?? existing.deliveryType ?? 'FREE';
    const nextDeliveryCharge =
      dto.deliveryCharge !== undefined
        ? dto.deliveryCharge
        : existing.deliveryCharge;

    this.validateDelivery(nextDeliveryType, nextDeliveryCharge);

    const delivery = this.resolveDelivery(nextDeliveryType, nextDeliveryCharge);

    const slug =
      dto.name && dto.name !== existing.name
        ? await this.createUniqueSlug(dto.name, id)
        : existing.slug;

    const product = await this.prisma.product.update({
      where: { id },
      data: {
        name: dto.name ?? existing.name,
        slug,
        description:
          dto.description !== undefined ? dto.description : existing.description,
        detailsHtml:
          dto.detailsHtml !== undefined
            ? normalizeDetailsHtml(dto.detailsHtml)
            : existing.detailsHtml,
        category: dto.category ?? existing.category,
        originalPrice,
        priceAfterDiscount,
        badge:
          dto.badge !== undefined
            ? normalizeBadge(dto.badge)
            : existing.badge,
        imageUrl: dto.imageUrl ?? existing.imageUrl,
        hoverImageUrl:
          dto.hoverImageUrl !== undefined
            ? dto.hoverImageUrl
            : existing.hoverImageUrl,
        imagePublicId:
          dto.imagePublicId !== undefined
            ? dto.imagePublicId
            : existing.imagePublicId,
        hoverImagePublicId:
          dto.hoverImagePublicId !== undefined
            ? dto.hoverImagePublicId
            : existing.hoverImagePublicId,
        galleryImageUrls:
          dto.galleryImageUrls !== undefined
            ? dto.galleryImageUrls
            : existing.galleryImageUrls,
        galleryImagePublicIds:
          dto.galleryImagePublicIds !== undefined
            ? dto.galleryImagePublicIds
            : existing.galleryImagePublicIds,
        stock: dto.stock ?? existing.stock,
        status: dto.status ?? existing.status,
        isPopular: dto.isPopular ?? existing.isPopular,
        deliveryType: delivery.deliveryType,
        deliveryCharge: delivery.deliveryCharge,
      },
    });

    return this.toAdminProduct(product);
  }

  async deleteProduct(id: string) {
    const existing = await this.prisma.product.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException('Product not found');
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
      .map(mapProductToPublic);

    const latest = published.slice(0, 12).map(mapProductToPublic);

    const bestDeals = published
      .filter((product) => hasProductDiscount(product))
      .sort(
        (left, right) =>
          (getDiscountPercent(right) ?? 0) - (getDiscountPercent(left) ?? 0),
      )
      .slice(0, 12)
      .map(mapProductToPublic);

    return { popular, latest, bestDeals };
  }

  async findAllPublished() {
    const products = await this.prisma.product.findMany({
      where: { status: PUBLISHED },
      orderBy: { createdAt: 'desc' },
    });

    return products.map(mapProductToPublic);
  }

  async findPublishedById(id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, status: PUBLISHED },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return mapProductToPublic(product);
  }

  toAdminProduct(product: Product) {
    const discountPercent = getDiscountPercent(product);

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      detailsHtml: normalizeDetailsHtml(product.detailsHtml),
      category: product.category,
      originalPrice: product.originalPrice,
      priceAfterDiscount: product.priceAfterDiscount,
      price: mapProductToPublic(product).price,
      discountPercent,
      badge: normalizeBadge(product.badge),
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
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
