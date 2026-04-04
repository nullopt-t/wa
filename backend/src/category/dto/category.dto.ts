import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsHexColor, Min } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ description: 'الاسم بالعربية', required: true })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'الوصف' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'الأيقونة', required: true })
  @IsString()
  @IsNotEmpty()
  icon: string;

  @ApiProperty({ description: 'اللون', required: true })
  @IsString()
  @IsNotEmpty()
  @IsHexColor()
  color: string;

  @ApiPropertyOptional({ description: 'الترتيب' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  order?: number;

  @ApiPropertyOptional({ description: 'نشط' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateCategoryDto {
  @ApiPropertyOptional({ description: 'الاسم بالعربية' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'الوصف' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'الأيقونة' })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiPropertyOptional({ description: 'اللون' })
  @IsString()
  @IsOptional()
  @IsHexColor()
  color?: string;

  @ApiPropertyOptional({ description: 'الترتيب' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  order?: number;

  @ApiPropertyOptional({ description: 'نشط' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
