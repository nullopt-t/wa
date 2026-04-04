import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, MinLength } from 'class-validator';

export class UpdateFeedbackStatusDto {
  @ApiProperty({ description: 'الحالة', required: true, enum: ['pending', 'approved', 'rejected'] })
  @IsEnum(['pending', 'approved', 'rejected'])
  status: 'pending' | 'approved' | 'rejected';

  @ApiPropertyOptional({ description: 'رد الإدارة' })
  @IsString()
  @IsOptional()
  @MinLength(1)
  adminResponse?: string;
}
