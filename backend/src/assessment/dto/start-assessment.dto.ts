import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class StartAssessmentDto {
  @IsString()
  assessmentCode: string;

  @IsBoolean()
  @IsOptional()
  fromChat?: boolean;

  @IsString()
  @IsOptional()
  sessionId?: string;
}
