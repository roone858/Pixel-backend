/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  /*** 🔍 FIND METHODS ***/

  async findAll() {
    const users = await this.userModel.find().select('-password -phone').lean();
    if (!users.length) throw new NotFoundException('No users found');
    return users;
  }

  async findById(id: string) {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email });
  }

  async findByIdentifier(identifier: string): Promise<UserDocument | null> {
    const user = await this.userModel
      .findOne({
        $or: [{ email: identifier }, { username: identifier }],
      })
      .exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByFacebookId(facebookId: string) {
    return this.userModel.findOne({ facebookId }).exec();
  }

  /*** 🔐 PASSWORD METHODS ***/

  async hashPassword(password: string): Promise<string> {
    const saltRounds = +process.env.SALT_ROUNDS;
    return bcrypt.hash(password + process.env.HASH_PASSWORD_KEY, saltRounds);
  }

  async comparePasswords(
    enteredPassword: string,
    storedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(
      enteredPassword + process.env.HASH_PASSWORD_KEY,
      storedPassword,
    );
  }

  async changePassword(
    id: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<User | null> {
    const user = await this.findById(id);
    if (!user) return null;

    const isPasswordValid = await this.comparePasswords(
      currentPassword,
      user.password,
    );
    if (!isPasswordValid) return null;

    const hashedNewPassword = await this.hashPassword(newPassword);
    return this.userModel.findByIdAndUpdate(
      id,
      { password: hashedNewPassword },
      { new: true },
    );
  }

  /*** 👤 USER CREATION & UPDATE ***/

  async createUser(createUserDto: CreateUserDto): Promise<UserDocument> {
    const user = new this.userModel(createUserDto);
    return user.save();
  }

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await this.hashPassword(createUserDto.password);
    const user = new this.userModel({
      ...createUserDto,
      role: 'user',
      password: hashedPassword,
    });
    const result = await user.save();

    const { password, ...userWithoutPassword } = result.toObject();
    return userWithoutPassword;
  }

  async updateUser(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const { password, ...updateData } = updateUserDto;
    return this.userModel.findByIdAndUpdate(userId, updateData, { new: true });
  }

  async confirmEmail(userId: string): Promise<any> {
    return this.userModel.findByIdAndUpdate(
      userId,
      { emailConfirmed: true },
      { new: true },
    );
  }

  async updateProfileImage(userId: string, filename: string): Promise<any> {
    return this.userModel.findByIdAndUpdate(
      userId,
      {
        $set: {
          'profile.photo':
            'http://localhost:3000/users/profile-picture/' + filename,
        },
      }, // تحديث `photo` فقط مع الاحتفاظ بباقي الحقول
      { new: true },
    );
  }
}
