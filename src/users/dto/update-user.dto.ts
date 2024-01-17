import {
  IsOptional,
  IsString,
  IsEmail,
  IsNotEmpty,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class UserProfileDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  lastName?: string;
  // Add other profile details as needed
}

class UserPreferencesDto {
  // Define user preferences properties
}

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  username?: string;

  @IsEmail()
  @IsNotEmpty()
  @IsOptional()
  email?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  password?: string;

  @Type(() => UserProfileDto)
  @ValidateNested()
  @IsOptional()
  profile?: UserProfileDto;

  @Type(() => UserPreferencesDto)
  @ValidateNested()
  @IsOptional()
  preferences?: UserPreferencesDto;

  @IsArray()
  @IsNotEmpty()
  @IsOptional()
  authenticationTokens?: string[];
}
