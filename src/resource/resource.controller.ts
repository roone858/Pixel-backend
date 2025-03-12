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
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { User } from 'src/users/decorators/user.decorator';
import { diskStorage } from 'multer';
import * as path from 'path';
import { UserDocument } from 'src/users/schemas/user.schema';
import { join } from 'path';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { UpdateResourceDto } from './dto/update-resource.dto';
// import mongoose from 'mongoose';

@Controller('resources')
export class ResourceController {
  constructor(
    private readonly resourceService: ResourceService,
    // private readonly subscriptionService: SubscriptionService,
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
    @Query('width') width: string,
    @Res() res: Response,
  ) {
    const inputImagePath = join(__dirname, '..', '..', 'uploads', image);
    const outputImagePath = join(__dirname, '..', '..', 'watermark', image);
    const isPaymentNotExpired = (res.req as any).isSubscriptionValid;
    if (isPaymentNotExpired) {
      res.sendFile(inputImagePath);
    } else {
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
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads', // Specify the directory where files will be stored
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
  async uploadResource(
    @UploadedFile() file,
    @User() user: UserDocument,
    @Body() body,
  ) {
    const tags = body.tags;
    const imageDetails = await this.resourceService.calculateImageDetails(
      file,
      body.title,
      body.description,
      tags,
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
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FilesInterceptor('files', 22, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const fileExtension = path.extname(file.originalname);
          const name = path.basename(file.originalname, fileExtension);
          const fileName = `${name}-${Date.now()}${fileExtension}`;
          cb(null, fileName);
        },
      }),
    }),
  )
  async uploadResources(
    @UploadedFiles() files,
    @User() user: UserDocument,
    @Body() body: any,
  ) {
    // Ensure body titles and descriptions are arrays
    const titles = Array.isArray(body.titles) ? body.titles : [body.titles];
    const tags = Array.isArray(body.tags) ? body.tags : [body.tags];
    const descriptions = Array.isArray(body.descriptions)
      ? body.descriptions
      : [body.descriptions];

    if (
      files.length !== titles.length ||
      files.length !== descriptions.length
    ) {
      throw new Error('Mismatch between uploaded files and metadata.');
    }

    const imageDetails = await Promise.all(
      files.map(async (file, index) => {
        return this.resourceService.calculateImageDetails(
          file,
          titles[index] || `Untitled ${index + 1}`,
          descriptions[index] || '',
          JSON.parse(tags[index]),
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
  async update(@Param('id') id: string, @Body() body: UpdateResourceDto) {
    return this.resourceService.update(id, body);
  }
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.resourceService.delete(id);
  }
}
