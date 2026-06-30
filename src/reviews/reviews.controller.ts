import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { CreateReviewDto } from './dto/create-review.dto';
import { CheckOrderItemReviewStatusDto } from './dto/check-order-item-review-status.dto';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  findPublished(@Query('limit') limit?: string) {
    const parsedLimit =
      limit && !Number.isNaN(Number(limit)) ? Number(limit) : undefined;
    return this.reviewsService.findPublished(parsedLimit);
  }

  @Get('summary')
  getSummary() {
    return this.reviewsService.getSummary();
  }

  @Get('product/:productId')
  findByProduct(@Param('productId') productId: string) {
    return this.reviewsService.findPublishedByProduct(productId);
  }

  @Get('eligibility/:productId')
  @UseGuards(AuthGuard('jwt'))
  getEligibility(
    @CurrentUser() user: AuthenticatedUser,
    @Param('productId') productId: string,
    @Query('orderNumber') orderNumber?: string,
  ) {
    return this.reviewsService.getEligibility(user, productId, orderNumber);
  }

  @Get('me/reviewed-products')
  @UseGuards(AuthGuard('jwt'))
  findReviewedProductIds(@CurrentUser() user: AuthenticatedUser) {
    return this.reviewsService.findReviewedProductIds(user.id);
  }

  @Post('me/order-item-status')
  @UseGuards(AuthGuard('jwt'))
  getOrderItemReviewStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CheckOrderItemReviewStatusDto,
  ) {
    return this.reviewsService.getOrderItemReviewStatus(user, dto.items);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.createForCustomer(user, dto);
  }
}
