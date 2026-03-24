import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class SubmitAnswerDto {
  @IsString()
  assessmentCode: string;

  @IsString()
  questionId: string;

  @IsNumber()
  selectedValue: number;

  @IsString()
  @IsOptional()
  sessionId?: string;

  @IsBoolean()
  @IsOptional()
  fromChat?: boolean;
}
