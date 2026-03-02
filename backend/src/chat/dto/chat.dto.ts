import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class EmotionDto {
  @IsString()
  @IsNotEmpty()
  emotion: string;

  @IsString()
  @IsNotEmpty()
  confidence: number;

  @IsString()
  @IsNotEmpty()
  intensity: number;
}

export class CreateChatSessionDto {
  @IsOptional()
  @IsString()
  title?: string;
}

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsNotEmpty()
  role: 'user' | 'assistant' | 'system';

  @IsOptional()
  @IsBoolean()
  analyzeEmotions?: boolean = true;
}

export class ChatResponseDto {
  @IsString()
  message: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmotionDto)
  emotions?: EmotionDto[];

  @IsBoolean()
  crisisDetected?: boolean;

  @IsArray()
  @IsString({ each: true })
  suggestions?: string[];

  @IsBoolean()
  recommendTherapist?: boolean;

  @IsString()
  disclaimer?: string;
}
