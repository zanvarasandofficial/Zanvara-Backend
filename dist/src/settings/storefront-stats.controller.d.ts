import { StorefrontStatsService } from './storefront-stats.service';
export declare class StorefrontStatsController {
    private readonly storefrontStatsService;
    constructor(storefrontStatsService: StorefrontStatsService);
    getStats(): Promise<{
        productCount: number;
        customerCount: number;
    }>;
}
