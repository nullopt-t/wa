import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsArray, IsBoolean, IsMongoId } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({ description: 'العنوان', required: true })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'المحتوى', required: true })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ description: 'معرف القسم' })
  @IsMongoId()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'الوسوم' })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'الصور' })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({ description: 'مجهول' })
  @IsBoolean()
  @IsOptional()
  isAnonymous?: boolean;
}

export class UpdatePostDto {
  @ApiPropertyOptional({ description: 'العنوان' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'المحتوى' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ description: 'معرف القسم' })
  @IsOptional()
  @IsMongoId()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'الوسوم' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'مجهول' })
  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;

  @ApiPropertyOptional({ description: 'مغلق' })
  @IsOptional()
  @IsBoolean()
  isClosed?: boolean;

  @ApiPropertyOptional({ description: 'مثبت' })
  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;
}

export class LikePostDto {
  @ApiProperty({ description: 'معرف المنشور', required: true })
  @IsMongoId()
  postId: string;
}
