import { Controller, Get } from '@nestjs/common';
import { HeroService } from './hero.service';

@Controller('settings/hero')
export class HeroController {
  constructor(private readonly heroService: HeroService) {}

  @Get()
  async getHeroSettings() {
    const hero = await this.heroService.getHeroSettings();
    return this.heroService.toPublicHero(hero);
  }
}
