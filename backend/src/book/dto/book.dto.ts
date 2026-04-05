import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsUrl, Min } from 'class-validator';

export class CreateBookDto {
  @ApiProperty({ description: 'عنوان الكتاب', required: true })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'رابط العنوان', required: true })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({ description: 'المؤلف', required: true })
  @IsString()
  @IsNotEmpty()
  author: string;

  @ApiPropertyOptional({ description: 'صورة الغلاف' })
  @IsUrl()
  @IsOptional()
  coverImage?: string;

  @ApiPropertyOptional({ description: 'رابط ملف الكتاب (PDF)' })
  @IsUrl()
  @IsOptional()
  fileUrl?: string;

  @ApiProperty({ description: 'الوصف', required: true })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ description: 'عدد الصفحات' })
  @IsNumber()
  @Min(1)
  @IsOptional()
  pages?: number;

  @ApiPropertyOptional({ description: 'مميز', default: false })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @ApiPropertyOptional({ description: 'نشط', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateBookDto {
  @ApiPropertyOptional({ description: 'عنوان الكتاب' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'رابط العنوان' })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional({ description: 'المؤلف' })
  @IsString()
  @IsOptional()
  author?: string;

  @ApiPropertyOptional({ description: 'صورة الغلاف' })
  @IsUrl()
  @IsOptional()
  coverImage?: string;

  @ApiPropertyOptional({ description: 'رابط ملف الكتاب' })
  @IsUrl()
  @IsOptional()
  fileUrl?: string;

  @ApiPropertyOptional({ description: 'الوصف' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'عدد الصفحات' })
  @IsNumber()
  @Min(1)
  @IsOptional()
  pages?: number;

  @ApiPropertyOptional({ description: 'مميز' })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @ApiPropertyOptional({ description: 'نشط' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
