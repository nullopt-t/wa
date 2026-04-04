import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsArray, IsBoolean, IsMongoId, IsNumber, IsEnum, MaxLength, MinLength } from 'class-validator';

export class CreateArticleDto {
  @ApiProperty({ description: 'العنوان', required: true })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(200)
  title: string;

  @ApiProperty({ description: 'الرابط المختصر', required: true })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  slug: string;

  @ApiProperty({ description: 'ملخص', required: true })
  @IsString()
  @IsNotEmpty()
  @MinLength(20)
  @MaxLength(500)
  excerpt: string;

  @ApiProperty({ description: 'المحتوى', required: true })
  @IsString()
  @IsNotEmpty()
  @MinLength(100)
  content: string;

  @ApiPropertyOptional({ description: 'الوسوم' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'مميز' })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ description: 'الترتيب' })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiPropertyOptional({ description: 'الحالة', enum: ['draft', 'published', 'archived'] })
  @IsOptional()
  @IsEnum(['draft', 'published', 'archived'])
  status?: string;

  @ApiPropertyOptional({ description: 'وقت القراءة' })
  @IsOptional()
  @IsNumber()
  readTime?: number;
}

export class UpdateArticleDto {
  @ApiPropertyOptional({ description: 'العنوان' })
  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({ description: 'الرابط المختصر' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  slug?: string;

  @ApiPropertyOptional({ description: 'ملخص' })
  @IsOptional()
  @IsString()
  @MinLength(20)
  @MaxLength(500)
  excerpt?: string;

  @ApiPropertyOptional({ description: 'المحتوى' })
  @IsOptional()
  @IsString()
  @MinLength(100)
  content?: string;

  @ApiPropertyOptional({ description: 'الوسوم' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'مميز' })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ description: 'الترتيب' })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiPropertyOptional({ description: 'الحالة', enum: ['draft', 'published', 'archived'] })
  @IsOptional()
  @IsEnum(['draft', 'published', 'archived'])
  status?: string;

  @ApiPropertyOptional({ description: 'وقت القراءة' })
  @IsOptional()
  @IsNumber()
  readTime?: number;

  @ApiPropertyOptional({ description: 'تاريخ النشر' })
  @IsOptional()
  publishedAt?: Date;
}
