// category.controller.ts
import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { Category } from './schemas/category.schema';
import { CategoryService } from './category.service';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  async createCategory(@Body() category: Category): Promise<Category> {
    return this.categoryService.createCategory(category);
  }

  @Get()
  async getAllCategories(): Promise<Category[]> {
    return this.categoryService.findAllCategories();
  }

  @Get(':id')
  async getCategoryById(@Param('id') id: string): Promise<Category> {
    return this.categoryService.findCategoryById(id);
  }
}
