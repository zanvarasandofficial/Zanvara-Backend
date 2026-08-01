"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreSettingsService = exports.DEFAULT_PKR_TO_USD_RATE = exports.DEFAULT_FREE_DELIVERY_MIN_TABLE_QUANTITY = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const STORE_SETTINGS_ID = 'store';
exports.DEFAULT_FREE_DELIVERY_MIN_TABLE_QUANTITY = 2;
exports.DEFAULT_PKR_TO_USD_RATE = 278;
let StoreSettingsService = class StoreSettingsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getStoreSettings() {
        const existing = await this.prisma.storeSetting.findUnique({
            where: { id: STORE_SETTINGS_ID },
        });
        if (existing) {
            return existing;
        }
        return this.prisma.storeSetting.create({
            data: {
                id: STORE_SETTINGS_ID,
                freeDeliveryMinTableQuantity: exports.DEFAULT_FREE_DELIVERY_MIN_TABLE_QUANTITY,
                pkrToUsdRate: exports.DEFAULT_PKR_TO_USD_RATE,
            },
        });
    }
    toPublicSettings(settings) {
        return {
            freeDeliveryMinTableQuantity: settings.freeDeliveryMinTableQuantity,
            pkrToUsdRate: settings.pkrToUsdRate ?? exports.DEFAULT_PKR_TO_USD_RATE,
            updatedAt: settings.updatedAt,
        };
    }
    async updateStoreSettings(dto) {
        const createData = {
            id: STORE_SETTINGS_ID,
            freeDeliveryMinTableQuantity: dto.freeDeliveryMinTableQuantity ?? exports.DEFAULT_FREE_DELIVERY_MIN_TABLE_QUANTITY,
            pkrToUsdRate: dto.pkrToUsdRate ?? exports.DEFAULT_PKR_TO_USD_RATE,
        };
        const updateData = {};
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
};
exports.StoreSettingsService = StoreSettingsService;
exports.StoreSettingsService = StoreSettingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StoreSettingsService);
//# sourceMappingURL=store-settings.service.js.map