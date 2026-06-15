import { Controller, Get, Param } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('landing')
  getLandingProducts() {
    return this.productsService.getLandingProducts();
  }

  @Get()
  findAll() {
    return this.productsService.findAllPublished();
  }

  @Get(':id')
  getProduct(@Param('id') id: string) {
    return this.productsService.findPublishedById(id);
  }
}
