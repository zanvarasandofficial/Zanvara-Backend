import { Controller, Get } from '@nestjs/common';
import { StoreSettingsService } from './store-settings.service';

@Controller('settings/store')
export class StoreSettingsController {
  constructor(private readonly storeSettingsService: StoreSettingsService) {}

  @Get()
  async getStoreSettings() {
    const settings = await this.storeSettingsService.getStoreSettings();
    return this.storeSettingsService.toPublicSettings(settings);
  }
}
