import { CategoriesService } from './categories.service';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    listCategories(): Promise<{
        id: string;
        name: string;
        slug: string;
        image: string;
        count: string;
        productCount: number;
    }[]>;
    listCategoryNames(): Promise<string[]>;
}
