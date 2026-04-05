import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  IsEnum,
  IsHexColor,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateJourneyResourceDto {
  @ApiProperty({ enum: ['article', 'video', 'book'], required: true })
  @IsString()
  @IsNotEmpty()
  resourceType: string;

  @ApiProperty({ description: 'Resource ID (ObjectId)', required: true })
  @IsString()
  @IsNotEmpty()
  resourceId: string;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  isMandatory?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  order?: number;
}

export class CreateJourneyLevelDto {
  @ApiProperty({ description: 'Level number (1-4)', required: true })
  @IsNumber()
  @Min(1)
  levelNumber: number;

  @ApiProperty({ description: 'Level name', required: true })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Level description', required: true })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ default: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  order?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  requiredCompletions?: number;

  @ApiPropertyOptional({ type: [CreateJourneyResourceDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateJourneyResourceDto)
  @IsOptional()
  resources?: CreateJourneyResourceDto[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  color?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  icon?: string;
}

export class CreateJourneyDto {
  @ApiProperty({ description: 'Journey name', required: true })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Journey description', required: true })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  longDescription?: string;

  @ApiPropertyOptional({ type: [CreateJourneyLevelDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateJourneyLevelDto)
  @IsOptional()
  levels?: CreateJourneyLevelDto[];

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @IsHexColor()
  color?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  estimatedDuration?: number;
}

export class UpdateJourneyDto {
  @ApiPropertyOptional({ description: 'Journey name' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Journey description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  longDescription?: string;

  @ApiPropertyOptional({ type: [CreateJourneyLevelDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateJourneyLevelDto)
  @IsOptional()
  levels?: CreateJourneyLevelDto[];

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @IsHexColor()
  color?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @IsOptional()
  estimatedDuration?: number;
}

export class CompleteResourceDto {
  @ApiProperty({ enum: ['article', 'video', 'book'], required: true })
  @IsString()
  @IsNotEmpty()
  resourceType: string;

  @ApiProperty({ description: 'Resource ID (ObjectId)', required: true })
  @IsString()
  @IsNotEmpty()
  resourceId: string;
}

export class JourneyProgressResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  currentLevel: number;

  @ApiProperty()
  startedAt: Date;

  @ApiProperty({ nullable: true })
  completedAt?: Date;

  @ApiProperty()
  isCompleted: boolean;

  @ApiProperty({ type: [Object] })
  levelProgress: any[];

  @ApiProperty()
  overallProgress: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
