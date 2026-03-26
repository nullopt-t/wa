import { IsString, IsEmail, IsNumber, IsEnum, Min, Max, MinLength, MaxLength, IsOptional } from 'class-validator';

export class CreateFeedbackDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  content: string;

  @IsEnum(['suggestion', 'complaint', 'praise', 'technical', 'other'])
  @IsOptional()
  category?: 'suggestion' | 'complaint' | 'praise' | 'technical' | 'other';
}
