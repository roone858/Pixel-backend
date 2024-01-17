import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

class FileDetailsDto {
  @IsNotEmpty()
  @IsString()
  filename: string;

  @IsNotEmpty()
  @IsNumber()
  size: number;
}

class MetadataDto {
  @IsNotEmpty()
  @IsString()
  size: string;

  @IsNotEmpty()
  @IsString()
  resolution: string;

  @IsNotEmpty()
  @IsString()
  format: string;
}

export class CreateResourceDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsArray()
  tags: string[];

  @IsNotEmpty()
  @IsString()
  category: string; // Assuming category is a string, adjust as per your actual type

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FileDetailsDto)
  files?: FileDetailsDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => MetadataDto)
  metadata?: MetadataDto;

  @IsNotEmpty()
  @IsString()
  uploader: string; // Assuming uploader is a string, adjust as per your actual type
}
