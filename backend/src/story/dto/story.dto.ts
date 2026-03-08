import { IsString, IsNotEmpty, IsOptional, IsEnum, IsBoolean, IsMongoId, IsArray, MinLength, MaxLength, IsNumber, IsInt } from 'class-validator';

export class CreateStoryDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(200)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(5000)
  content: string;

  @IsEnum(['recovery', 'relationships', 'depression', 'anxiety', 'addiction', 'other'])
  @IsNotEmpty()
  category: string;

  @IsBoolean()
  @IsOptional()
  isAnonymous?: boolean;

  @IsOptional()
  @IsString()
  featuredImage?: string;
}

export class UpdateStoryDto {
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(50)
  @MaxLength(5000)
  content?: string;

  @IsOptional()
  @IsEnum(['recovery', 'relationships', 'depression', 'anxiety', 'addiction', 'other'])
  category?: string;

  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;

  @IsOptional()
  @IsString()
  featuredImage?: string;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsEnum(['pending', 'approved', 'rejected', 'hidden'])
  status?: string;

  @IsOptional()
  @IsNumber()
  readTime?: number;
}

export class LikeStoryDto {
  @IsMongoId()
  storyId: string;
}

export class StoryFilterDto {
  @IsOptional()
  @IsEnum(['all', 'recovery', 'relationships', 'depression', 'anxiety', 'addiction', 'other'])
  category?: string;

  @IsOptional()
  @IsEnum(['pending', 'approved', 'rejected', 'hidden'])
  status?: string;

  @IsOptional()
  @IsEnum(['newest', 'oldest', 'most-viewed', 'most-liked'])
  sort?: string;

  @IsOptional()
  @IsInt()
  page?: number;

  @IsOptional()
  @IsInt()
  limit?: number;
}
