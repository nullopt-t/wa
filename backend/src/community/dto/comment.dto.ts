import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsMongoId } from 'class-validator';

export class CreateCommentDto {
  @IsMongoId()
  @IsNotEmpty()
  postId: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsMongoId()
  @IsOptional()
  parentId?: string; // For replies

  @IsBoolean()
  @IsOptional()
  isAnonymous?: boolean;
}

export class UpdateCommentDto {
  @IsOptional()
  @IsString()
  content?: string;
}
