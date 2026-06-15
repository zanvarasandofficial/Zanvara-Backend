import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '../common/constants/role.constant';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  @Get('dashboard')
  getDashboard(@CurrentUser() user: AuthenticatedUser) {
    return {
      message: 'Welcome to the Zanvara admin dashboard',
      admin: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      note: 'Only users with ADMIN role in the database can access this route.',
    };
  }
}
