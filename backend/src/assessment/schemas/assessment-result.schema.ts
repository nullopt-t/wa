import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Assessment } from './assessment.schema';

export type AssessmentResultDocument = AssessmentResult & Document;

@Schema({ timestamps: true })
export class AssessmentResult {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Assessment', required: true })
  assessment: Assessment;

  @Prop({ type: [{
    questionId: Types.ObjectId,
    questionOrder: Number,
    selectedValue: Number,
    selectedText: String,
    selectedTextAr: String,
  }], required: true })
  answers: Array<{
    questionId: Types.ObjectId;
    questionOrder: number;
    selectedValue: number;
    selectedText: string;
    selectedTextAr: string;
  }>;

  @Prop({ required: true })
  totalScore: number;

  @Prop({ required: true })
  maxScore: number;

  @Prop({ required: true })
  percentage: number;

  @Prop({ required: true })
  severity: string;

  @Prop({ required: true })
  severityAr: string;

  @Prop({ required: true })
  severityLevel: string; // 'normal', 'mild', 'moderate', 'severe'

  @Prop({ type: {
    interpretation: String,
    interpretationAr: String,
    recommendations: [String],
    recommendationsAr: [String],
    recommendTherapist: Boolean,
    disclaimer: String,
    disclaimerAr: String,
  } })
  aiInterpretation: {
    interpretation: string;
    interpretationAr: string;
    recommendations: string[];
    recommendationsAr: string[];
    recommendTherapist: boolean;
    disclaimer: string;
    disclaimerAr: string;
  };

  @Prop({ type: Types.ObjectId, ref: 'ChatSession' })
  sessionId: Types.ObjectId;

  @Prop({ default: false })
  isFromChat: boolean;

  @Prop({ type: {
    detectedEmotions: [String],
    crisisKeywords: [String],
    userMood: String,
  } })
  context: {
    detectedEmotions: string[];
    crisisKeywords: string[];
    userMood: string;
  };
}

export const AssessmentResultSchema = SchemaFactory.createForClass(AssessmentResult);

// Indexes for efficient querying
AssessmentResultSchema.index({ userId: 1, createdAt: -1 });
AssessmentResultSchema.index({ userId: 1, assessment: 1 });
AssessmentResultSchema.index({ sessionId: 1 });
