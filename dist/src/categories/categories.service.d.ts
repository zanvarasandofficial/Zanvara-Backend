import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
export declare class CategoriesService {
    private readonly prisma;
    private readonly cloudinaryService;
    constructor(prisma: PrismaService, cloudinaryService: CloudinaryService);
    private ensureDefaultCategories;
    private getProductCountsByName;
    private mapPublicCategory;
    private mapAdminCategory;
    listPublicCategories(): Promise<{
        id: string;
        name: string;
        slug: string;
        image: string;
        count: string;
        productCount: number;
    }[]>;
    listAdminCategories(): Promise<{
        id: string;
        name: string;
        slug: string;
        imageUrl: string;
        imagePublicId: string | null;
        sortOrder: number;
        isActive: boolean;
        productCount: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    listCategoryNames(): Promise<string[]>;
    private findCategoryOrThrow;
    createCategory(dto: CreateCategoryDto): Promise<{
        id: string;
        name: string;
        slug: string;
        imageUrl: string;
        imagePublicId: string | null;
        sortOrder: number;
        isActive: boolean;
        productCount: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateCategory(id: string, dto: UpdateCategoryDto): Promise<{
        id: string;
        name: string;
        slug: string;
        imageUrl: string;
        imagePublicId: string | null;
        sortOrder: number;
        isActive: boolean;
        productCount: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteCategory(id: string): Promise<{
        success: boolean;
    }>;
    uploadCategoryImage(id: string, file?: Express.Multer.File): Promise<{
        id: string;
        name: string;
        slug: string;
        imageUrl: string;
        imagePublicId: string | null;
        sortOrder: number;
        isActive: boolean;
        productCount: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
