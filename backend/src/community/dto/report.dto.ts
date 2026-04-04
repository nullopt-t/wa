import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsOptional, IsMongoId } from 'class-validator';
import { ReportReason } from '../schemas/report.schema';

export class CreateReportDto {
  @ApiProperty({ description: 'نوع الهدف', required: true, enum: ['post', 'comment'] })
  @IsString()
  @IsNotEmpty()
  @IsEnum(['post', 'comment'])
  targetType: 'post' | 'comment';

  @ApiProperty({ description: 'معرف الهدف', required: true })
  @IsMongoId()
  @IsNotEmpty()
  targetId: string;

  @ApiProperty({ description: 'السبب', required: true, enum: ReportReason })
  @IsEnum(ReportReason)
  @IsNotEmpty()
  reason: ReportReason;

  @ApiPropertyOptional({ description: 'الوصف' })
  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateReportDto {
  @ApiPropertyOptional({ description: 'الحالة', enum: ['pending', 'reviewed', 'resolved', 'dismissed'] })
  @IsOptional()
  @IsEnum(['pending', 'reviewed', 'resolved', 'dismissed'])
  status?: string;

  @ApiPropertyOptional({ description: 'ملاحظات الإدارة' })
  @IsOptional()
  @IsString()
  adminNotes?: string;
}
