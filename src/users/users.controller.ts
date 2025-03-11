import {
  Body,
  Post,
  Controller,
  UseGuards,
  Get,
  Patch,
  Request,
  Req,
  UseInterceptors,
  UploadedFile,
  Res,
  Param,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AdminGuard } from './guards/admin.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { Response } from 'express';
import * as path from 'path';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @UseGuards(AdminGuard)
  findAll() {
    return this.usersService.findAll();
  }
  @Post()
  @UseGuards(AuthGuard('jwt'))
  @UseGuards(AdminGuard)
  createAdmin(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Patch()
  @UseGuards(AuthGuard('jwt'))
  update(@Request() req: any, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateUser(req.user._id, updateUserDto);
  }

  @Post('change-password')
  @UseGuards(AuthGuard('jwt'))
  async changePassword(
    @Req() req,
    @Body('currentPassword') currentPassword: string,
    @Body('newPassword') newPassword: string,
  ): Promise<{ message: string }> {
    const { _id } = req.user;
    const user = await this.usersService.changePassword(
      _id,
      currentPassword,
      newPassword,
    );
    if (user) {
      return { message: 'Password changed successfully' };
    } else {
      return {
        message: 'Current password is incorrect or failed to change password',
      };
    }
  }

  @Post('profile-picture')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/profiles pictures', // Specify the directory where files will be stored
        filename: (req, file, cb) => {
          const userId = (req as any).user._id; // Assuming you have a user object in the request
          const fileExtension = path.extname(file.originalname);
          const fileName = userId + Date.now() + fileExtension;
          cb(null, fileName);
        },
      }),
    }),
  )
  async uploadProfilePicture(
    @UploadedFile() file,
    @Body('updatedUser') updatedUser: string,
    @Req() req,
  ) {
    const { _id } = req.user;
    const userData = JSON.parse(updatedUser);
    await this.usersService.updateUser(_id, userData);
    const userProfile = await this.usersService.updateProfileImage(
      _id,
      file.filename,
    );
    return userProfile;
  }
  @Get('/profile-picture/:userPic')
  // @UseGuards(JwtAuthGuard)
  getProfilePicture(@Param('userPic') userPic: string, @Res() res: Response) {
    const imagePath = join(
      __dirname,
      '..',
      '..',
      'uploads',
      'profiles pictures',
      userPic || 'default-profile-picture.webp',
    );
    res.sendFile(imagePath);
  }
}
