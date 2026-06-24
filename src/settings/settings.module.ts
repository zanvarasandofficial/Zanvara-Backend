import { Module } from '@nestjs/common';
import { AdminHeroController } from '../admin/admin-hero.controller';
import { HeroController } from './hero.controller';
import { HeroService } from './hero.service';
import { StorefrontStatsController } from './storefront-stats.controller';
import { StorefrontStatsService } from './storefront-stats.service';

@Module({
  controllers: [HeroController, AdminHeroController, StorefrontStatsController],
  providers: [HeroService, StorefrontStatsService],
  exports: [HeroService, StorefrontStatsService],
})
export class SettingsModule {}
