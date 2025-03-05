import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ResourceService } from './resource.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { User } from 'src/users/user.decorator';
import { diskStorage } from 'multer';
import * as path from 'path';
import { UserDocument } from 'src/users/schemas/user.schema';
import { join } from 'path';
import { Response } from 'express';
import { JwtPayload } from 'src/auth/jwt.decorator';
import { SubscriptionService } from 'src/subscription/subscription.service';
// import mongoose from 'mongoose';

@Controller('resource')
export class ResourceController {
  constructor(
    private readonly resourceService: ResourceService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  @Get()
  async getImages(@Res() res: Response, @Query('query') query: string) {
    // Check if a search query is provided
    if (query) {
      // Fetch images based on the search query
      const searchedImages = await this.resourceService.findAllByTitle(query);

      // Send the searched images as JSON in the response
      res.json(searchedImages);
    } else {
      // If no search query is provided, fetch all images
      const allImages = await this.resourceService.findAll();

      // Send all images as JSON in the response
      res.json(allImages);
    }
  }
  @Get('/:image')
  async getImage(
    @Param('image') image: string,
    @JwtPayload() payload: any,
    @Res() res: Response,
  ) {
    const inputImagePath = join(__dirname, '..', '..', 'uploads', image);
    const outputImagePath = join(__dirname, '..', '..', 'watermark', image);
    const isPaymentNotExpired = payload
      ? await this.subscriptionService.isSubscriptionValid(payload._id)
      : false;
    console.log(isPaymentNotExpired);
    if (isPaymentNotExpired) {
      // Send the image if payment is not expired
      res.sendFile(inputImagePath);
    } else {
      // const watermark = await this.resourceService.addWatermark(
      //   inputImagePath,
      //   outputImagePath,
      // );
      // Add watermark if payment is expired

      const outputImagePathWithExtension = outputImagePath.replace(
        /\.[^/.]+$/,
        '.jpg',
      );
      res.sendFile(outputImagePathWithExtension);
    }
  }

  @Get('details/:imageName')
  async getFileDetails(
    @Param('imageName') imageName: string,
    @Res() res: Response,
  ) {
    const data = await this.resourceService.findByFileName(imageName);
    res.json(data);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads', // Specify the directory where files will be stored
        filename: (req, file, cb) => {
          // console.log(file);
          // const userId = (req as any).user._id; // Assuming you have a user object in the request
          const fileExtension = path.extname(file.originalname);
          const name = path.basename(
            file.originalname,
            path.extname(file.originalname),
          );
          const fileName = name + Date.now() + fileExtension;

          cb(null, fileName);
        },
      }),
    }),
  )
  async uploadResource(
    @UploadedFile() file,
    @User() user: UserDocument,
    @Body() body,
  ) {
    const imageDetails = await this.resourceService.calculateImageDetails(
      file,
      body.title,
      body.description,
      body.categoryId,
      user._id,
    );
    const inputImagePath = join(
      __dirname,
      '..',
      '..',
      'uploads',
      imageDetails.fileName,
    );
    const outputImagePath = join(
      __dirname,
      '..',
      '..',
      'watermark',
      imageDetails.fileName,
    );
    await this.resourceService.addWatermark(inputImagePath, outputImagePath);
    return this.resourceService.create(imageDetails);
  }
  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FilesInterceptor('images', 22, {
      // 'images' is the field name for the array of files
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const fileExtension = path.extname(file.originalname);
          const name = path.basename(
            file.originalname,
            path.extname(file.originalname),
          );
          const fileName = name + Date.now() + fileExtension;
          cb(null, fileName);
        },
      }),
    }),
  )
  async uploadResources(
    @UploadedFiles() files,
    @User() user: UserDocument,
    @Body() body,
  ) {
    const imageDetails = await Promise.all(
      files.map(async (file) => {
        return this.resourceService.calculateImageDetails(
          file,
          body.title + file.filename,
          body.description,
          body.categoryId,
          user._id,
        );
      }),
    );

    const createdResources = await Promise.all(
      imageDetails.map(async (details) => {
        const inputImagePath = join(
          __dirname,
          '..',
          '..',
          'uploads',
          details.fileName,
        );
        const outputImagePath = join(
          __dirname,
          '..',
          '..',
          'watermark',
          details.fileName,
        );
        await this.resourceService.addWatermark(
          inputImagePath,
          outputImagePath,
        );
        return this.resourceService.create(details);
      }),
    );

    return createdResources;
  }
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body) {
    return this.resourceService.update(id, body);
  }
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.resourceService.delete(id);
  }
}
