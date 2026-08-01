import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '../common/constants/role.constant';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UpdateStoreSettingsDto } from '../settings/dto/update-store-settings.dto';
import { StoreSettingsService } from '../settings/store-settings.service';

@Controller('admin/store-settings')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN)
export class AdminStoreSettingsController {
  constructor(private readonly storeSettingsService: StoreSettingsService) {}

  @Get()
  async getStoreSettings() {
    const settings = await this.storeSettingsService.getStoreSettings();
    return this.storeSettingsService.toPublicSettings(settings);
  }

  @Put()
  updateStoreSettings(@Body() dto: UpdateStoreSettingsDto) {
    return this.storeSettingsService.updateStoreSettings(dto);
  }
}
