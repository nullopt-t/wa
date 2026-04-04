import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsMongoId, IsEnum, IsBoolean } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ description: 'المحتوى', required: true })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ description: 'معرف المقال' })
  @IsOptional()
  @IsMongoId()
  articleId?: string;

  @ApiPropertyOptional({ description: 'معرف المنشور' })
  @IsOptional()
  @IsMongoId()
  postId?: string;

  @ApiPropertyOptional({ description: 'معرف التعليق الأصلي' })
  @IsOptional()
  @IsMongoId()
  parentId?: string; // For nested replies

  @ApiPropertyOptional({ description: 'معرف التعليق الأصلي (اسم بديل)' })
  @IsOptional()
  @IsMongoId()
  parentCommentId?: string; // Alias for parentId

  @ApiPropertyOptional({ description: 'مجهول' })
  @IsBoolean()
  @IsOptional()
  isAnonymous?: boolean;
}

export class UpdateCommentDto {
  @ApiPropertyOptional({ description: 'المحتوى' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ description: 'تم التعديل' })
  @IsOptional()
  @IsBoolean()
  isEdited?: boolean;
}

export class AdminUpdateCommentDto {
  @ApiPropertyOptional({ description: 'المحتوى' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ description: 'الحالة', enum: ['active', 'deleted', 'reported', 'pending', 'approved', 'hidden'] })
  @IsOptional()
  @IsEnum(['active', 'deleted', 'reported', 'pending', 'approved', 'hidden'])
  status?: string;

  @ApiPropertyOptional({ description: 'تم التعديل' })
  @IsOptional()
  @IsBoolean()
  isEdited?: boolean;
}
