import { IsString, IsNumber, IsBoolean, IsArray, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class AnswerDto {
  @IsString()
  questionId: string;

  @IsNumber()
  questionOrder: number;

  @IsNumber()
  selectedValue: number;

  @IsString()
  selectedText: string;

  @IsString()
  selectedTextAr: string;
}

export class AIInterpretationDto {
  @IsString()
  interpretation: string;

  @IsString()
  interpretationAr: string;

  @IsArray()
  @IsString({ each: true })
  recommendations: string[];

  @IsArray()
  @IsString({ each: true })
  recommendationsAr: string[];

  @IsBoolean()
  recommendTherapist: boolean;

  @IsString()
  disclaimer: string;

  @IsString()
  disclaimerAr: string;
}

export class AssessmentResultResponseDto {
  @IsString()
  _id: string;

  @IsString()
  assessmentCode: string;

  @IsString()
  assessmentName: string;

  @IsString()
  assessmentNameAr: string;

  @IsNumber()
  totalScore: number;

  @IsNumber()
  maxScore: number;

  @IsNumber()
  percentage: number;

  @IsString()
  severity: string;

  @IsString()
  severityAr: string;

  @IsString()
  severityLevel: string;

  @IsObject()
  @ValidateNested()
  @Type(() => AIInterpretationDto)
  aiInterpretation: AIInterpretationDto;

  @IsString()
  createdAt: string;

  @IsBoolean()
  isFromChat: boolean;
}

export class AssessmentListItemDto {
  @IsString()
  _id: string;

  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsString()
  nameAr: string;

  @IsString()
  description: string;

  @IsString()
  descriptionAr: string;

  @IsString()
  category: string;

  @IsNumber()
  totalQuestions: number;

  @IsNumber()
  timesTaken: number;
}
