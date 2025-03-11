import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Resource } from './schemas/resource.schema';
import * as fs from 'fs';
import * as path from 'path';
import sizeOf from 'image-size';
import * as Jimp from 'jimp';
import { UpdateResourceDto } from './dto/update-resource.dto';

@Injectable()
export class ResourceService {
  constructor(
    @InjectModel(Resource.name) private readonly resourceModel: Model<Resource>,
  ) {}

  /** 🆕 Create a new resource */
  async create(resourceData: Partial<Resource>): Promise<Resource> {
    return new this.resourceModel(resourceData).save();
  }

  /** 📂 Retrieve all resources */
  async findAll(): Promise<Resource[]> {
    return this.resourceModel.find().exec();
  }

  /** 🔍 Find resources by title */
  async findAllByTitle(title: string): Promise<Resource[]> {
    return this.resourceModel.find({ title: new RegExp(title, 'i') }).exec();
  }

  /** 🔍 Find resource by file name */
  async findByFileName(fileName: string): Promise<Resource | null> {
    return this.resourceModel.findOne({ fileName }).exec();
  }

  /** 🔍 Find resource by ID */
  async findById(id: string): Promise<Resource | null> {
    return this.resourceModel.findById(id).exec();
  }

  /** ✏️ Update a resource */
  async update(
    id: string,
    resourceData: UpdateResourceDto,
  ): Promise<Resource | null> {
    return this.resourceModel
      .findByIdAndUpdate(id, resourceData, { new: true })
      .exec();
  }

  /** ❌ Delete a resource and remove associated file */
  async delete(id: string): Promise<Resource | null> {
    const resource = await this.resourceModel.findById(id).exec();
    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    // Remove the associated file
    const filePath = path.join(
      __dirname,
      '..',
      '..',
      'uploads',
      resource.fileName,
    );
    fs.unlink(filePath, (err) => {
      if (err) console.error(`Error deleting file: ${err.message}`);
    });

    return this.resourceModel.findByIdAndDelete(id).exec();
  }

  /** 📏 Calculate image details */
  async calculateImageDetails(
    file: any,
    title: string,
    description: string,
    tags: string[],
    categoryId: string,
    userId: string,
  ): Promise<any> {
    try {
      const { size: fileSizeInBytes } = fs.statSync(file.path);
      const fileSizeInMB = fileSizeInBytes / (1024 * 1024); // Convert bytes to MB
      const extension = path.extname(file.originalname);
      const dimensions = sizeOf(file.path);
      const dpi = 72;
      const resolutionX = Math.round(dimensions.width / (dpi / 25.4));
      const resolutionY = Math.round(dimensions.height / (dpi / 25.4));

      return {
        title,
        description,
        tags,
        category: categoryId,
        fileName: file.filename,
        metadata: {
          size: fileSizeInMB.toFixed(2),
          resolution: `${resolutionX}x${resolutionY}`,
          format: extension,
        },
        uploader: userId,
        downloadStatistics: { downloadCount: 0, likes: 0 },
      };
    } catch (error) {
      throw new Error('Error calculating image details');
    }
  }

  /** 🌊 Add watermark to an image */
  async addWatermark(
    inputImagePath: string,
    outputImagePath: string,
  ): Promise<void> {
    try {
      const image = await Jimp.read(inputImagePath);
      image.resize(500, Jimp.AUTO); // Resize image

      // Create watermark image
      const watermarkText = 'Pixel';
      const watermarkImage = new Jimp(image.getWidth(), image.getHeight());

      // Load font
      const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
      const stepSize = 100;

      // Apply watermark text in a repeated pattern
      for (let x = 0; x < image.getWidth(); x += stepSize) {
        for (let y = 0; y < image.getHeight(); y += stepSize) {
          watermarkImage.print(font, x, y, watermarkText);
        }
      }

      // Merge watermark onto image
      image.composite(watermarkImage, 0, 0, {
        mode: Jimp.BLEND_SOURCE_OVER,
        opacitySource: 0.5, // Adjust the opacity as needed
        opacityDest: 1, // This is required in BlendMode
      });

      // Save output file with .jpg extension
      const outputImagePathWithExtension = outputImagePath.replace(
        /\.[^/.]+$/,
        '.jpg',
      );
      await image.writeAsync(outputImagePathWithExtension);
    } catch (error) {
      console.error('Error adding watermark:', error);
    }
  }

  //  Resizing image function
  async resize(imagePath: string, width: number) {
    // تحميل الصورة باستخدام Jimp
    const image = await Jimp.read(imagePath);

    // تعديل حجم الصورة وضغطها
    image
      .resize(width, Jimp.AUTO) // ضبط العرض إلى 150 بكسل والطول يتغير تلقائياً
      .quality(70); // تقليل الجودة إلى 70%

    // تحويل الصورة إلى Buffer وإرسالها
    const imageBuffer = await image.getBufferAsync(Jimp.MIME_JPEG);
    return imageBuffer;
  }
}
