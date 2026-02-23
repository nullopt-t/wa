import { IsString, IsNotEmpty, IsEnum, IsOptional, IsMongoId } from 'class-validator';
import { ReportReason } from '../schemas/report.schema';

export class CreateReportDto {
  @IsString()
  @IsNotEmpty()
  @IsEnum(['post', 'comment'])
  targetType: 'post' | 'comment';

  @IsMongoId()
  @IsNotEmpty()
  targetId: string;

  @IsEnum(ReportReason)
  @IsNotEmpty()
  reason: ReportReason;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateReportDto {
  @IsOptional()
  @IsEnum(['pending', 'reviewed', 'resolved', 'dismissed'])
  status?: string;

  @IsOptional()
  @IsString()
  adminNotes?: string;
}
