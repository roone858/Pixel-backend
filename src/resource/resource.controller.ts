import {
  Body,
  Controller,
  Post,
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
// import mongoose from 'mongoose';

@Controller('resource')
export class ResourceController {
  constructor(private readonly resourceService: ResourceService) {}

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
