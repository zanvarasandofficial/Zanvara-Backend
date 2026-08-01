import { UpdateStoreSettingsDto } from '../settings/dto/update-store-settings.dto';
import { StoreSettingsService } from '../settings/store-settings.service';
export declare class AdminStoreSettingsController {
    private readonly storeSettingsService;
    constructor(storeSettingsService: StoreSettingsService);
    getStoreSettings(): Promise<{
        freeDeliveryMinTableQuantity: number;
        pkrToUsdRate: number;
        updatedAt: Date;
    }>;
    updateStoreSettings(dto: UpdateStoreSettingsDto): Promise<{
        freeDeliveryMinTableQuantity: number;
        pkrToUsdRate: number;
        updatedAt: Date;
    }>;
}
