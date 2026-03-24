import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AssessmentDocument = Assessment & Document;

@Schema({ timestamps: true })
export class Assessment {
  @Prop({ required: true, unique: true })
  code: string; // e.g., 'PHQ-9', 'GAD-7', 'PSS-4'

  @Prop({ required: true })
  name: string; // e.g., 'Patient Health Questionnaire-9'

  @Prop({ required: true })
  nameAr: string; // e.g., 'اختبار الاكتئاب PHQ-9'

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  descriptionAr: string;

  @Prop({ required: true })
  category: string; // e.g., 'depression', 'anxiety', 'stress'

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ required: true })
  totalQuestions: number;

  @Prop({ required: true })
  minScore: number;

  @Prop({ required: true })
  maxScore: number;

  @Prop({ type: [{
    minScore: Number,
    maxScore: Number,
    severity: String,
    severityAr: String,
    color: String,
    description: String,
    descriptionAr: String,
  }] })
  severityLevels: Array<{
    minScore: number;
    maxScore: number;
    severity: string;
    severityAr: string;
    color: string;
    description: string;
    descriptionAr: string;
  }>;

  @Prop({ default: 0 })
  timesTaken: number;
}

export const AssessmentSchema = SchemaFactory.createForClass(Assessment);
