import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class EmotionDto {
  @ApiProperty({ description: 'المشاعر', required: true })
  @IsString()
  @IsNotEmpty()
  emotion: string;

  @ApiProperty({ description: 'مستوى الثقة', required: true })
  @IsNumber()
  @IsNotEmpty()
  confidence: number;

  @ApiProperty({ description: 'الشدة', required: true })
  @IsNumber()
  @IsNotEmpty()
  intensity: number;
}

export class CreateChatSessionDto {
  @ApiPropertyOptional({ description: 'العنوان' })
  @IsOptional()
  @IsString()
  title?: string;
}

export class SendMessageDto {
  @ApiProperty({ description: 'المحتوى', required: true })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ description: 'الدور', required: true, enum: ['user', 'assistant', 'system'] })
  @IsString()
  @IsNotEmpty()
  role: 'user' | 'assistant' | 'system';

  @ApiPropertyOptional({ description: 'تحليل المشاعر' })
  @IsOptional()
  @IsBoolean()
  analyzeEmotions?: boolean = true;
}

export class ChatResponseDto {
  @ApiProperty({ description: 'الرسالة', required: true })
  @IsString()
  message: string;

  @ApiPropertyOptional({ description: 'المشاعر', type: [EmotionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmotionDto)
  emotions?: EmotionDto[];

  @ApiPropertyOptional({ description: 'تم اكتشاف أزمة' })
  @IsBoolean()
  crisisDetected?: boolean;

  @ApiPropertyOptional({ description: 'الاقتراحات' })
  @IsArray()
  @IsString({ each: true })
  suggestions?: string[];

  @ApiPropertyOptional({ description: 'توصية بمعالج' })
  @IsBoolean()
  recommendTherapist?: boolean;

  @ApiPropertyOptional({ description: 'إخلاء المسؤولية' })
  @IsString()
  disclaimer?: string;
}
