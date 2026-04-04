import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsNumber, IsEnum, Min, Max, MinLength, MaxLength, IsOptional } from 'class-validator';

export class CreateFeedbackDto {
  @ApiPropertyOptional({ description: 'الاسم' })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ description: 'البريد الإلكتروني' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: 'التقييم', required: true })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ description: 'المحتوى', required: true })
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  content: string;

  @ApiPropertyOptional({ description: 'القسم', enum: ['suggestion', 'complaint', 'praise', 'technical', 'other'] })
  @IsEnum(['suggestion', 'complaint', 'praise', 'technical', 'other'])
  @IsOptional()
  category?: 'suggestion' | 'complaint' | 'praise' | 'technical' | 'other';
}
