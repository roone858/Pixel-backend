import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Res,
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
import { JwtPayload } from 'src/auth/jwt.decorator';
import { PaymentService } from 'src/payment/payment.service';
// import mongoose from 'mongoose';

@Controller('resource')
export class ResourceController {
  constructor(
    private readonly resourceService: ResourceService,
    private readonly paymentService: PaymentService,
  ) {}

  @Get()
  async getImages(@Res() res: Response) {
    // const uploadFolderPath = path.join(__dirname, '..', '..', 'uploads');
    // const imageFiles = fs.readdirSync(uploadFolderPath);
    const images = await this.resourceService.findAll();
    res.json(images);
  }

  @Get('/:image')
  async getImage(
    @Param('image') image: string,
    @JwtPayload() payload: any,
    @Res() res: Response,
  ) {
    const imagePath = join(__dirname, '..', '..', 'uploads', image);
    const isPaymentNotExpired = payload
      ? await this.paymentService.isPaymentNotExpired(payload._id)
      : false;

    if (isPaymentNotExpired) {
      // Send the image if payment is not expired
      res.sendFile(imagePath);
    } else {
      // Add watermark if payment is expired
      const watermark = await this.resourceService.addWatermark(imagePath);
      res.end(watermark);
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
    return this.resourceService.create(imageDetails);
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
