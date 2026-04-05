import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsBoolean, IsOptional } from 'class-validator';

export class CreateMedicalContactDto {
  @ApiProperty({ description: 'الاسم' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'رقم الهاتف' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ description: 'البريد الإلكتروني' })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'العنوان' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ description: 'النوع', enum: ['hospital', 'clinic', 'doctor'] })
  @IsEnum(['hospital', 'clinic', 'doctor'])
  @IsNotEmpty()
  type: string;

  @ApiPropertyOptional({ description: 'ملاحظات' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ description: 'نشط', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateMedicalContactDto {
  @ApiPropertyOptional({ description: 'الاسم' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'رقم الهاتف' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: 'البريد الإلكتروني' })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: 'العنوان' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ description: 'النوع', enum: ['hospital', 'clinic', 'doctor'] })
  @IsEnum(['hospital', 'clinic', 'doctor'])
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({ description: 'ملاحظات' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ description: 'نشط' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
