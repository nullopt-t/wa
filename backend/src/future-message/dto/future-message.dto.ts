import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsDateString, MaxLength, IsEmail, MinLength } from 'class-validator';

export class CreateFutureMessageDto {
  @ApiPropertyOptional({ description: 'العنوان' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  title?: string;

  @ApiProperty({ description: 'الرسالة', required: true })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(5000)
  message: string;

  @ApiProperty({ description: 'موعد التسليم', required: true })
  @IsDateString()
  @IsNotEmpty()
  deliverAt: string;

  @ApiPropertyOptional({ description: 'إشعار بالبريد' })
  @IsOptional()
  @IsBoolean()
  isEmailNotification?: boolean;

  @ApiPropertyOptional({ description: 'البريد الإلكتروني للمستلم' })
  @IsOptional()
  @IsString()
  @IsEmail()
  recipientEmail?: string;
}

export class UpdateFutureMessageDto {
  @ApiPropertyOptional({ description: 'العنوان' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  title?: string;

  @ApiPropertyOptional({ description: 'الرسالة' })
  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  message?: string;

  @ApiPropertyOptional({ description: 'موعد التسليم' })
  @IsOptional()
  @IsDateString()
  deliverAt?: string;

  @ApiPropertyOptional({ description: 'إشعار بالبريد' })
  @IsOptional()
  @IsBoolean()
  isEmailNotification?: boolean;

  @ApiPropertyOptional({ description: 'البريد الإلكتروني للمستلم' })
  @IsOptional()
  @IsString()
  @IsEmail()
  recipientEmail?: string;
}
