// resource.service.ts

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Resource } from './schemas/resource.schema';
import * as fs from 'fs';
import sizeOf from 'image-size';
import * as path from 'path';
import * as Jimp from 'jimp';
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
  async findAllByTitle(title): Promise<Resource[]> {
    // return this.resourceModel.find({titile.include(title)}).exec();
    return this.resourceModel
      .find({ title: { $regex: new RegExp(title, 'i') } })
      .exec();
  }

  async findByFileName(fileName: string): Promise<Resource> {
    return this.resourceModel.findOne({ fileName: fileName }).exec();
  }
  async findById(id: string): Promise<Resource> {
    return this.resourceModel.findById(id).exec();
  }

  async update(id: string, resourceData: Partial<Resource>): Promise<Resource> {
    return this.resourceModel
      .findByIdAndUpdate(id, resourceData, { new: true })
      .exec();
  }

  async delete(id: string): Promise<Resource> {
    const resource = await this.resourceModel.findById(id).exec();

    if (!resource) {
      // Handle the case where the resource is not found
      throw new Error('Resource not found');
    }

    // Delete the file from the uploads folder
    try {
      const imagePath = path.join(
        __dirname,
        '..',
        '..',
        'uploads',
        resource.fileName,
      );
      console.log(imagePath);
      fs.unlink(imagePath, () => {});
    } catch (err) {
      // Handle file deletion error (optional)
      console.error(`Error deleting file: ${err.message}`);
    }
    return this.resourceModel.findByIdAndDelete(id).exec();
  }

  async calculateImageDetails(
    file,
    title,
    description,
    categoryId,
    userId,
  ): Promise<any> {
    try {
      // Get the file size
      const fileSizeInBytes = fs.statSync(file.path).size;
      // Convert file size to megabytes
      const fileSizeInMB = fileSizeInBytes / (1024 * 1024); // 1 MB = 1024 KB = 1024 * 1024 bytes
      // const fileSizeInKB = fileSizeInBytes / 1024; // 1 KB = 1024 bytes
      const extension = path.extname(file.originalname);
      // Get the image dimensions (width and height)
      const dimensions = sizeOf(file.path);
      const width = dimensions.width;
      const height = dimensions.height;

      // Calculate the resolution (assuming DPI is 72, you can adjust as needed)
      const dpi = 72;
      const resolutionX = Math.round(width / (dpi / 25.4)); // 25.4 mm is 1 inch
      const resolutionY = Math.round(height / (dpi / 25.4));

      return {
        title: title,
        description: description,
        category: categoryId, // Replace with an actual ObjectId of a category
        fileName: file.filename,
        metadata: {
          size: fileSizeInMB,
          resolution: resolutionX + 'x' + resolutionY,
          format: extension,
        },
        uploader: userId, // Replace with an actual ObjectId of a authentic  user
        downloadStatistics: {
          downloadCount: 0,
          likes: 0,
        },
      };
    } catch (error) {
      throw new Error('Error calculating image details');
    }
  }
  async addWatermark(inputImagePath, outputImagePath) {
    try {
      // await sharp(inputImagePath)
      //   .resize({ width: 800, height: 600 })
      //   .toFile(outputImagePath);

      const image = await Jimp.read(inputImagePath);
      // const watermark = await Jimp.read(watermarkPath); // Replace with the path to your watermark image

      // Resize watermark if needed
      // watermark.resize(image.getWidth() / 2, Jimp.AUTO);

      // Calculate the position to center the watermark
      image.resize(500, Jimp.AUTO);
      // const xx = (image.getWidth() - image.getWidth()) / 2;
      // const yy = (image.getHeight() - image.getHeight()) / 2;

      const watermarkText = 'Pixel'; // Change this to your desired watermark text
      const watermarkImage = new Jimp(image.getWidth(), image.getHeight());

      // Add the text to the watermark image
      const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
      watermarkImage.print(font, 0, 0, watermarkText);
      const stepSize = 200; // Adjust the step size as needed

      for (let x = 0; x < image.getWidth(); x += stepSize) {
        for (let y = 0; y < image.getHeight(); y += stepSize) {
          watermarkImage.print(font, x, y, watermarkText);
        }
      }
      // Composite the watermark onto the image
      image.composite(watermarkImage, 0, 0, {
        mode: Jimp.BLEND_SOURCE_OVER,
        opacitySource: 0.5, // Adjust the opacity as needed
        opacityDest: 1, // This is required in BlendMode
      });
      // Save the final image

      const outputImagePathWithExtension = outputImagePath.replace(
        /\.[^/.]+$/,
        '.jpg',
      );

      // Save the final image with the desired extension
      await image.writeAsync(outputImagePathWithExtension);
      // await image.writeAsync(outputImagePath);
      // Send the result
      // const imageBuffer = await image.getBufferAsync(Jimp.MIME_JPEG);
      // return imageBuffer;
    } catch (error) {
      console.error('Error adding watermark:', error);
    }
  }
}
