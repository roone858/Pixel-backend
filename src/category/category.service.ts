// category.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  async createCategory(category: Category): Promise<Category> {
    const createdCategory = new this.categoryModel({
      ...category,
      name: category.name.toLowerCase(),
    });
    return createdCategory.save();
  }

  async findAllCategories(): Promise<Category[]> {
    return this.categoryModel.find().exec();
  }

  async findCategoryById(id: string): Promise<Category> {
    return this.categoryModel.findById(id).exec();
  }
  async findByIdAndDelete(id: string): Promise<Category> {
    return this.categoryModel.findByIdAndDelete(id).exec();
  }
}
