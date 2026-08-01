import { StoreSetting } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateStoreSettingsDto } from './dto/update-store-settings.dto';
export declare const DEFAULT_FREE_DELIVERY_MIN_TABLE_QUANTITY = 2;
export declare const DEFAULT_PKR_TO_USD_RATE = 278;
export declare class StoreSettingsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getStoreSettings(): Promise<StoreSetting>;
    toPublicSettings(settings: StoreSetting): {
        freeDeliveryMinTableQuantity: number;
        pkrToUsdRate: number;
        updatedAt: Date;
    };
    updateStoreSettings(dto: UpdateStoreSettingsDto): Promise<{
        freeDeliveryMinTableQuantity: number;
        pkrToUsdRate: number;
        updatedAt: Date;
    }>;
}
