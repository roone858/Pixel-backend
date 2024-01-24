import {
  IsString,
  IsEmail,
  IsNotEmpty,
  // IsArray,
  ValidateNested,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum UserRole {
  User = 'user',
  Admin = 'admin',
}

class UserProfileDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  // @IsString()
  // @IsNotEmpty()
  // lastName: string;
  // // Add other profile details as needed
}

class UserPreferencesDto {
  // Define user preferences properties
}

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @Type(() => UserProfileDto)
  @ValidateNested()
  profile: UserProfileDto;

  @Type(() => UserPreferencesDto)
  @ValidateNested()
  preferences: UserPreferencesDto;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole; // <-- Use the UserRole enum here

  // @IsArray()
  // @IsNotEmpty()
  // authenticationTokens: string[];
}
