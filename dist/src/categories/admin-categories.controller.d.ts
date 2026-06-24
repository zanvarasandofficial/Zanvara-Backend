import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
export declare class AdminCategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    listCategories(): Promise<{
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
    uploadCategoryImage(id: string, file: Express.Multer.File): Promise<{
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
