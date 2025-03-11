import {
  IsString,
  IsArray,
  ValidateNested,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

class FileDetailsDto {
  @IsOptional()
  @IsString()
  filename?: string;

  @IsOptional()
  @IsNumber()
  size?: number;
}

class MetadataDto {
  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @IsString()
  resolution?: string;

  @IsOptional()
  @IsString()
  format?: string;
}

export class UpdateResourceDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsString()
  category?: string; // Assuming category is a string, adjust as per your actual type

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FileDetailsDto)
  files?: FileDetailsDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => MetadataDto)
  metadata?: MetadataDto;

  @IsOptional()
  @IsString()
  uploader?: string; // Assuming uploader is a string, adjust as per your actual type
}
