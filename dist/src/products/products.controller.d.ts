import { ProductsService } from './products.service';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    getLandingProducts(): Promise<{
        popular: import("./product.mapper").PublicProduct[];
        latest: import("./product.mapper").PublicProduct[];
        bestDeals: import("./product.mapper").PublicProduct[];
    }>;
    findAll(): Promise<import("./product.mapper").PublicProduct[]>;
    getProduct(id: string): Promise<import("./product.mapper").PublicProduct>;
}
