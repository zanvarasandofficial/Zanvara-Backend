import { Module } from '@nestjs/common';
import { AdminHeroController } from '../admin/admin-hero.controller';
import { HeroController } from './hero.controller';
import { HeroService } from './hero.service';

@Module({
  controllers: [HeroController, AdminHeroController],
  providers: [HeroService],
  exports: [HeroService],
})
export class SettingsModule {}
