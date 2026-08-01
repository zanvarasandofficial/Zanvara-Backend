import { StoreSettingsService } from './store-settings.service';
export declare class StoreSettingsController {
    private readonly storeSettingsService;
    constructor(storeSettingsService: StoreSettingsService);
    getStoreSettings(): Promise<{
        freeDeliveryMinTableQuantity: number;
        pkrToUsdRate: number;
        updatedAt: Date;
    }>;
}
