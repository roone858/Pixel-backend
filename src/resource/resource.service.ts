// resource.service.ts

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Resource } from './schemas/resource.schema';
import * as fs from 'fs';
import sizeOf from 'image-size';
import * as path from 'path';

@Injectable()
export class ResourceService {
  constructor(
    @InjectModel(Resource.name) private readonly resourceModel: Model<Resource>,
  ) {}

  async create(resourceData: Partial<Resource>): Promise<Resource> {
    const createdResource = new this.resourceModel(resourceData);
    return createdResource.save();
  }

  async findAll(): Promise<Resource[]> {
    return this.resourceModel.find().exec();
  }

  async findById(id: string): Promise<Resource> {
    return this.resourceModel.findById(id).exec();
  }

  async update(id: string, resourceData: Partial<Resource>): Promise<Resource> {
    return this.resourceModel
      .findByIdAndUpdate(id, resourceData, { new: true })
      .exec();
  }

  // async delete(id: string): Promise<Resource> {
  //   return this.resourceModel.findByIdAndRemove(id).exec();
  // }

  async calculateImageDetails(file: any): Promise<any> {
    try {
      // Get the file size
      const fileSizeInBytes = fs.statSync(file.path).size;
      // Convert file size to megabytes
      const fileSizeInMB = fileSizeInBytes / (1024 * 1024); // 1 MB = 1024 KB = 1024 * 1024 bytes
      const fileSizeInKB = fileSizeInBytes / 1024; // 1 KB = 1024 bytes
      const extension = path.extname(file.originalname);
      // Get the image dimensions (width and height)
      const dimensions = sizeOf(file.path);
      const width = dimensions.width;
      const height = dimensions.height;

      // Calculate the resolution (assuming DPI is 72, you can adjust as needed)
      const dpi = 72;
      const resolutionX = Math.round(width / (dpi / 25.4)); // 25.4 mm is 1 inch
      const resolutionY = Math.round(height / (dpi / 25.4));
      console.log('resolutionY Is ' + resolutionY);

      return {
        fileSizeInBytes,
        fileSizeInKB,
        fileSizeInMB,
        extension,
        width,
        height,
        resolutionX,
        resolutionY,
      };
    } catch (error) {
      throw new Error('Error calculating image details');
    }
  }
}
