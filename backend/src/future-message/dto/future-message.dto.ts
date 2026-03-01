import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsDateString, MaxLength, IsEmail, MinLength } from 'class-validator';

export class CreateFutureMessageDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  title?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(5000)
  message: string;

  @IsDateString()
  @IsNotEmpty()
  deliverAt: string;

  @IsOptional()
  @IsBoolean()
  isEmailNotification?: boolean;

  @IsOptional()
  @IsString()
  @IsEmail()
  recipientEmail?: string;
}

export class UpdateFutureMessageDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  message?: string;

  @IsOptional()
  @IsDateString()
  deliverAt?: string;

  @IsOptional()
  @IsBoolean()
  isEmailNotification?: boolean;

  @IsOptional()
  @IsString()
  @IsEmail()
  recipientEmail?: string;
}
