import { Controller, Get } from '@nestjs/common';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  listCategories() {
    return this.categoriesService.listPublicCategories();
  }

  @Get('names')
  listCategoryNames() {
    return this.categoriesService.listCategoryNames();
  }
}
