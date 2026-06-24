import { Controller, Get } from '@nestjs/common';
import { StorefrontStatsService } from './storefront-stats.service';

@Controller('public')
export class StorefrontStatsController {
  constructor(private readonly storefrontStatsService: StorefrontStatsService) {}

  @Get('storefront-stats')
  getStats() {
    return this.storefrontStatsService.getStats();
  }
}
