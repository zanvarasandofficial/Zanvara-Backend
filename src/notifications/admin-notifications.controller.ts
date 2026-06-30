import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '../common/constants/role.constant';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { AdminNotificationsService } from './admin-notifications.service';
import { UpdateNotificationStatusDto } from './dto/update-notification-status.dto';

@Controller('admin/notifications')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN)
export class AdminNotificationsController {
  constructor(
    private readonly notificationsService: AdminNotificationsService,
  ) {}

  @Get()
  findAll(@Query('limit') limit?: string) {
    const parsedLimit = limit ? Number(limit) : 50;
    return this.notificationsService.findAllAdmin(
      Number.isFinite(parsedLimit) ? parsedLimit : 50,
    );
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateNotificationStatusDto,
  ) {
    return this.notificationsService.updateStatus(id, dto.status);
  }
}
