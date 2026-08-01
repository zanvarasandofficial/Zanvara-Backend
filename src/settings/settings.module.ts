import { Module } from '@nestjs/common';
import { AdminHeroController } from '../admin/admin-hero.controller';
import { AdminStoreSettingsController } from '../admin/admin-store-settings.controller';
import { HeroController } from './hero.controller';
import { HeroService } from './hero.service';
import { StoreSettingsController } from './store-settings.controller';
import { StoreSettingsService } from './store-settings.service';
import { StorefrontStatsController } from './storefront-stats.controller';
import { StorefrontStatsService } from './storefront-stats.service';

@Module({
  controllers: [
    HeroController,
    AdminHeroController,
    StoreSettingsController,
    AdminStoreSettingsController,
    StorefrontStatsController,
  ],
  providers: [HeroService, StoreSettingsService, StorefrontStatsService],
  exports: [HeroService, StoreSettingsService, StorefrontStatsService],
})
export class SettingsModule {}
