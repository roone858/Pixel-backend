// category.controller.ts
import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { Category } from './schemas/category.schema';
import { CategoryService } from './category.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
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
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<Category> {
    return this.categoryService.findByIdAndDelete(id);
  }
}
