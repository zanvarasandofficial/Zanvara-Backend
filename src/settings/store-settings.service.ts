import { Injectable } from '@nestjs/common';
import { StoreSetting } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateStoreSettingsDto } from './dto/update-store-settings.dto';

const STORE_SETTINGS_ID = 'store';

export const DEFAULT_FREE_DELIVERY_MIN_TABLE_QUANTITY = 2;
export const DEFAULT_PKR_TO_USD_RATE = 278;

@Injectable()
export class StoreSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getStoreSettings(): Promise<StoreSetting> {
    const existing = await this.prisma.storeSetting.findUnique({
      where: { id: STORE_SETTINGS_ID },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.storeSetting.create({
      data: {
        id: STORE_SETTINGS_ID,
        freeDeliveryMinTableQuantity: DEFAULT_FREE_DELIVERY_MIN_TABLE_QUANTITY,
        pkrToUsdRate: DEFAULT_PKR_TO_USD_RATE,
      },
    });
  }

  toPublicSettings(settings: StoreSetting) {
    return {
      freeDeliveryMinTableQuantity: settings.freeDeliveryMinTableQuantity,
      pkrToUsdRate: settings.pkrToUsdRate ?? DEFAULT_PKR_TO_USD_RATE,
      updatedAt: settings.updatedAt,
    };
  }

  async updateStoreSettings(dto: UpdateStoreSettingsDto) {
    const createData = {
      id: STORE_SETTINGS_ID,
      freeDeliveryMinTableQuantity:
        dto.freeDeliveryMinTableQuantity ?? DEFAULT_FREE_DELIVERY_MIN_TABLE_QUANTITY,
      pkrToUsdRate: dto.pkrToUsdRate ?? DEFAULT_PKR_TO_USD_RATE,
    };

    const updateData: {
      freeDeliveryMinTableQuantity?: number;
      pkrToUsdRate?: number;
    } = {};

    if (dto.freeDeliveryMinTableQuantity !== undefined) {
      updateData.freeDeliveryMinTableQuantity = dto.freeDeliveryMinTableQuantity;
    }
    if (dto.pkrToUsdRate !== undefined) {
      updateData.pkrToUsdRate = dto.pkrToUsdRate;
    }

    const settings = await this.prisma.storeSetting.upsert({
      where: { id: STORE_SETTINGS_ID },
      create: createData,
      update: updateData,
    });

    return this.toPublicSettings(settings);
  }
}
