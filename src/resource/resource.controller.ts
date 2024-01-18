import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
  // Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ResourceService } from './resource.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from 'src/users/user.decorator';
import { diskStorage } from 'multer';
import * as path from 'path';
import { UserDocument } from 'src/users/schemas/user.schema';
import { join } from 'path';
import { Response } from 'express';
// import mongoose from 'mongoose';

@Controller('resource')
export class ResourceController {
  constructor(private readonly resourceService: ResourceService) {}

  @Get()
  async getImages(@Res() res: Response) {
    // const uploadFolderPath = path.join(__dirname, '..', '..', 'uploads');
    // const imageFiles = fs.readdirSync(uploadFolderPath);
    const images = await this.resourceService.findAll();
    res.json(images);
  }

  @Get('/:image')
  async getFile(@Param('image') image: string, @Res() res: Response) {
    // Construct the path to the user's profile picture
    const isPremium = false;
    const imagePath = join(__dirname, '..', '..', 'uploads', image);
    const watermarkPath = join(
      __dirname,
      '..',
      '..',
      'uploads',
      'pngegg1705536854239.png',
    );
    const watermark = await this.resourceService.addWatermark(
      imagePath,
      watermarkPath,
    );
    isPremium ? res.sendFile(imagePath) : res.end(watermark);
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
    const imageDetails = await this.resourceService.calculateImageDetails(file);
    return this.resourceService.create({
      title: body.title,
      description: body.description,
      category: '60a1d71b4e99a25c942ef1c1', // Replace with an actual ObjectId of a category
      fileName: file.filename,
      metadata: {
        size: imageDetails.fileSizeInMB,
        resolution: imageDetails.resolutionX + 'x' + imageDetails.resolutionX,
        format: imageDetails.extension,
      },
      uploader: user._id, // Replace with an actual ObjectId of a authentic  user
      downloadStatistics: {
        downloadCount: 10,
        likes: 5,
      },
    });
  }
}
