import {
  IsString,
  IsEmail,
  IsNotEmpty,
  ValidateNested,
  IsEnum,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Optional } from '@nestjs/common';

export enum UserRole {
  User = 'user',
  Admin = 'admin',
}

class UserProfileDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @Optional()
  photo: string;
}

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsOptional()
  @IsString()
  googleId?: string;

  @IsOptional()
  @IsString()
  facebookId?: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsOptional()
  @IsBoolean()
  emailConfirmed?: boolean;

  @IsString()
  password?: string;

  @Type(() => UserProfileDto)
  @ValidateNested()
  profile: UserProfileDto;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole; // <-- Use the UserRole enum here

  // @IsArray()
  // @IsNotEmpty()
  // authenticationTokens: string[];
}
