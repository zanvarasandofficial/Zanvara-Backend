import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StoreCategory } from '@prisma/client';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

const PUBLISHED = 'PUBLISHED';

const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/jpg',
]);

const DEFAULT_CATEGORIES: Array<{
  name: string;
  sortOrder: number;
  imageUrl: string;
}> = [
  {
    name: 'Electronics',
    sortOrder: 0,
    imageUrl:
      'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Fashion',
    sortOrder: 1,
    imageUrl:
      'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Home & Living',
    sortOrder: 2,
    imageUrl:
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Beauty',
    sortOrder: 3,
    imageUrl:
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Sports',
    sortOrder: 4,
    imageUrl:
      'https://images.unsplash.com/photo-1517649763962-0c62306601b7?auto=format&fit=crop&w=800&q=80',
  },
];

function slugifyName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function formatItemCount(count: number) {
  if (count === 1) {
    return '1 item';
  }

  return `${count} items`;
}

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  private async ensureDefaultCategories() {
    const count = await this.prisma.storeCategory.count();

    if (count > 0) {
      return;
    }

    await this.prisma.storeCategory.createMany({
      data: DEFAULT_CATEGORIES.map((category) => ({
        name: category.name,
        slug: slugifyName(category.name),
        imageUrl: category.imageUrl,
        sortOrder: category.sortOrder,
        isActive: true,
      })),
    });
  }

  private async getProductCountsByName() {
    const products = await this.prisma.product.findMany({
      where: { status: PUBLISHED },
      select: { category: true },
    });

    const counts = new Map<string, number>();

    for (const product of products) {
      const key = product.category.trim();
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    return counts;
  }

  private mapPublicCategory(
    category: StoreCategory,
    productCount: number,
  ) {
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      image: category.imageUrl,
      count: formatItemCount(productCount),
      productCount,
    };
  }

  private mapAdminCategory(
    category: StoreCategory,
    productCount: number,
  ) {
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

    return categories.map((category) =>
      this.mapPublicCategory(
        category,
        productCounts.get(category.name) ?? 0,
      ),
    );
  }

  async listAdminCategories() {
    await this.ensureDefaultCategories();

    const [categories, productCounts] = await Promise.all([
      this.prisma.storeCategory.findMany({
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      }),
      this.getProductCountsByName(),
    ]);

    return categories.map((category) =>
      this.mapAdminCategory(
        category,
        productCounts.get(category.name) ?? 0,
      ),
    );
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

  private async findCategoryOrThrow(id: string) {
    const category = await this.prisma.storeCategory.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async createCategory(dto: CreateCategoryDto) {
    const name = dto.name.trim();
    const slug = slugifyName(name);

    if (!slug) {
      throw new BadRequestException('Category name is invalid');
    }

    const existing = await this.prisma.storeCategory.findFirst({
      where: {
        OR: [{ name }, { slug }],
      },
    });

    if (existing) {
      throw new ConflictException('Category already exists');
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

  async updateCategory(id: string, dto: UpdateCategoryDto) {
    const category = await this.findCategoryOrThrow(id);
    const data: {
      name?: string;
      slug?: string;
      imageUrl?: string;
      imagePublicId?: string | null;
      sortOrder?: number;
      isActive?: boolean;
    } = {};

    if (dto.name !== undefined) {
      const nextName = dto.name.trim();
      const slug = slugifyName(nextName);

      if (!slug) {
        throw new BadRequestException('Category name is invalid');
      }

      if (nextName !== category.name) {
        const existing = await this.prisma.storeCategory.findFirst({
          where: {
            OR: [{ name: nextName }, { slug }],
            NOT: { id },
          },
        });

        if (existing) {
          throw new ConflictException('Category name already exists');
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

    return this.mapAdminCategory(
      updated,
      productCounts.get(updated.name) ?? 0,
    );
  }

  async deleteCategory(id: string) {
    const category = await this.findCategoryOrThrow(id);

    const productCount = await this.prisma.product.count({
      where: {
        category: category.name,
        status: PUBLISHED,
      },
    });

    if (productCount > 0) {
      throw new BadRequestException(
        'Cannot delete a category that still has published products',
      );
    }

    await this.prisma.storeCategory.delete({ where: { id } });

    return { success: true };
  }

  async uploadCategoryImage(id: string, file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    if (!ALLOWED_IMAGE_TYPES.has(file.mimetype)) {
      throw new BadRequestException('Only JPG, PNG, or WEBP files are allowed');
    }

    const category = await this.findCategoryOrThrow(id);
    const result = await this.cloudinaryService.uploadCategoryImage(file);

    return this.updateCategory(id, {
      imageUrl: result.secure_url,
      imagePublicId: result.public_id,
    });
  }
}
