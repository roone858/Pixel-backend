import {
  IsString,
  IsEmail,
  IsNotEmpty,
  // IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class UserProfileDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;
  // Add other profile details as needed
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

  // @IsArray()
  // @IsNotEmpty()
  // authenticationTokens: string[];
}
