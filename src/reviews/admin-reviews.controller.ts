import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '../common/constants/role.constant';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateAdminReviewDto } from './dto/create-admin-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewsService } from './reviews.service';

@Controller('admin/reviews')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN)
export class AdminReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  findAll() {
    return this.reviewsService.findAllAdmin();
  }

  @Get('stats')
  getStats() {
    return this.reviewsService.getAdminStats();
  }

  @Post()
  create(@Body() dto: CreateAdminReviewDto) {
    return this.reviewsService.createForAdmin(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateReviewDto) {
    return this.reviewsService.updateAdmin(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reviewsService.deleteAdmin(id);
  }
}
