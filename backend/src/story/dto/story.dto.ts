import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsBoolean, IsMongoId, IsArray, MinLength, MaxLength, IsNumber, IsInt } from 'class-validator';

export class CreateStoryDto {
  @ApiProperty({ description: 'العنوان', required: true })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(200)
  title: string;

  @ApiProperty({ description: 'المحتوى', required: true })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(5000)
  content: string;

  @ApiProperty({ description: 'القسم', required: true, enum: ['recovery', 'relationships', 'depression', 'anxiety', 'addiction', 'other'] })
  @IsEnum(['recovery', 'relationships', 'depression', 'anxiety', 'addiction', 'other'])
  @IsNotEmpty()
  category: string;

  @ApiPropertyOptional({ description: 'مجهول' })
  @IsBoolean()
  @IsOptional()
  isAnonymous?: boolean;

  @ApiPropertyOptional({ description: 'الصورة المميزة' })
  @IsOptional()
  @IsString()
  featuredImage?: string;
}

export class UpdateStoryDto {
  @ApiPropertyOptional({ description: 'العنوان' })
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({ description: 'المحتوى' })
  @IsOptional()
  @IsString()
  @MinLength(50)
  @MaxLength(5000)
  content?: string;

  @ApiPropertyOptional({ description: 'القسم', enum: ['recovery', 'relationships', 'depression', 'anxiety', 'addiction', 'other'] })
  @IsOptional()
  @IsEnum(['recovery', 'relationships', 'depression', 'anxiety', 'addiction', 'other'])
  category?: string;

  @ApiPropertyOptional({ description: 'مجهول' })
  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;

  @ApiPropertyOptional({ description: 'الصورة المميزة' })
  @IsOptional()
  @IsString()
  featuredImage?: string;

  @ApiPropertyOptional({ description: 'مميز' })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ description: 'الحالة', enum: ['pending', 'approved', 'rejected', 'hidden'] })
  @IsOptional()
  @IsEnum(['pending', 'approved', 'rejected', 'hidden'])
  status?: string;

  @ApiPropertyOptional({ description: 'وقت القراءة' })
  @IsOptional()
  @IsNumber()
  readTime?: number;
}

export class LikeStoryDto {
  @ApiProperty({ description: 'معرف القصة', required: true })
  @IsMongoId()
  storyId: string;
}

export class StoryFilterDto {
  @ApiPropertyOptional({ description: 'القسم', enum: ['all', 'recovery', 'relationships', 'depression', 'anxiety', 'addiction', 'other'] })
  @IsOptional()
  @IsEnum(['all', 'recovery', 'relationships', 'depression', 'anxiety', 'addiction', 'other'])
  category?: string;

  @ApiPropertyOptional({ description: 'الحالة', enum: ['pending', 'approved', 'rejected', 'hidden'] })
  @IsOptional()
  @IsEnum(['pending', 'approved', 'rejected', 'hidden'])
  status?: string;

  @ApiPropertyOptional({ description: 'الترتيب', enum: ['newest', 'oldest', 'most-viewed', 'most-liked'] })
  @IsOptional()
  @IsEnum(['newest', 'oldest', 'most-viewed', 'most-liked'])
  sort?: string;

  @ApiPropertyOptional({ description: 'الصفحة' })
  @IsOptional()
  @IsInt()
  page?: number;

  @ApiPropertyOptional({ description: 'الحد الأقصى' })
  @IsOptional()
  @IsInt()
  limit?: number;
}
