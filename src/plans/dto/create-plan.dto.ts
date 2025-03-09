import {
  IsString,
  IsBoolean,
  IsArray,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class CreatePlanDto {
  @IsString()
  name: string;

  @IsString()
  priceId: string;

  @IsString()
  price: string;

  @IsNumber()
  period: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  features: string[];

  @IsOptional()
  @IsBoolean()
  isPopular?: boolean;
}
