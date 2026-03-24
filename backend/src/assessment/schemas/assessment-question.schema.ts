import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Assessment } from './assessment.schema';

export type AssessmentQuestionDocument = AssessmentQuestion & Document;

@Schema({ timestamps: true })
export class AssessmentQuestion {
  @Prop({ type: Types.ObjectId, ref: 'Assessment', required: true })
  assessment: Assessment;

  @Prop({ required: true })
  order: number;

  @Prop({ required: true })
  text: string;

  @Prop({ required: true })
  textAr: string;

  @Prop({ type: [{
    value: Number,
    text: String,
    textAr: String,
  }], required: true })
  options: Array<{
    value: number;
    text: string;
    textAr: string;
  }>;
}

export const AssessmentQuestionSchema = SchemaFactory.createForClass(AssessmentQuestion);

// Index for efficient querying
AssessmentQuestionSchema.index({ assessment: 1, order: 1 });
