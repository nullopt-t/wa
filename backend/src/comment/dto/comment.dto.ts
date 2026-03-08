import { IsString, IsNotEmpty, IsOptional, IsMongoId, IsEnum, IsBoolean } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsMongoId()
  articleId?: string;

  @IsOptional()
  @IsMongoId()
  postId?: string;

  @IsOptional()
  @IsMongoId()
  parentCommentId?: string;
}

export class UpdateCommentDto {
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsBoolean()
  isEdited?: boolean;
}

export class AdminUpdateCommentDto {
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsEnum(['active', 'deleted', 'reported'])
  status?: string;

  @IsOptional()
  @IsBoolean()
  isEdited?: boolean;
}
