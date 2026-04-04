import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsUrl, IsArray } from 'class-validator';

export class CreateVideoDto {
  @ApiProperty({ description: 'العنوان', required: true })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'الوصف', required: true })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'رابط الفيديو', required: true })
  @IsUrl()
  @IsNotEmpty()
  videoUrl: string;

  @ApiPropertyOptional({ description: 'صورة مصغرة' })
  @IsUrl()
  @IsOptional()
  thumbnailUrl?: string;

  @ApiPropertyOptional({ description: 'المدة' })
  @IsNumber()
  @IsOptional()
  duration?: number;

  @ApiPropertyOptional({ description: 'مميز' })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @ApiPropertyOptional({ description: 'نشط' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'القسم' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ description: 'الوسوم' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ description: 'الترتيب' })
  @IsNumber()
  @IsOptional()
  order?: number;
}

export class UpdateVideoDto {
  @ApiPropertyOptional({ description: 'العنوان' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'الوصف' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'رابط الفيديو' })
  @IsUrl()
  @IsOptional()
  videoUrl?: string;

  @ApiPropertyOptional({ description: 'صورة مصغرة' })
  @IsUrl()
  @IsOptional()
  thumbnailUrl?: string;

  @ApiPropertyOptional({ description: 'المدة' })
  @IsNumber()
  @IsOptional()
  duration?: number;

  @ApiPropertyOptional({ description: 'مميز' })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @ApiPropertyOptional({ description: 'نشط' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'القسم' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ description: 'الوسوم' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ description: 'الترتيب' })
  @IsNumber()
  @IsOptional()
  order?: number;
}
