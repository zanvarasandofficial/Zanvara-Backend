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
import { UpdateInboundStatusDto } from './dto/update-inbound-status.dto';
import { InboundService } from './inbound.service';

@Controller('admin/inbound')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN)
export class AdminInboundController {
  constructor(private readonly inboundService: InboundService) {}

  @Get()
  findAll(@Query('type') type?: string) {
    return this.inboundService.findAllAdmin(type);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateInboundStatusDto) {
    return this.inboundService.updateStatus(id, dto.status);
  }
}
