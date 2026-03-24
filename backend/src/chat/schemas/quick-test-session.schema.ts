import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type QuickTestSessionDocument = QuickTestSession & Document;

@Schema({ timestamps: true })
export class QuickTestSession {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'ChatSession', required: true })
  chatSessionId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  titleAr: string;

  @Prop({ required: true })
  symptom: string;

  @Prop({ type: [String], required: true })
  questions: string[];

  @Prop({ type: [String], required: true })
  questionsAr: string[];

  @Prop({ type: [String], default: [] })
  answers: string[];

  @Prop({ type: [String], default: [] })
  answersAr: string[];

  @Prop({ default: 0 })
  currentQuestionIndex: number;

  @Prop({ default: false })
  isComplete: boolean;

  @Prop({ type: Object })
  result?: {
    analysis: string;
    recommendations: string[];
    severity: string;
    recommendTherapist: boolean;
    disclaimer: string;
  };

  @Prop()
  completedAt?: Date;
}

export const QuickTestSessionSchema = SchemaFactory.createForClass(QuickTestSession);

// Indexes
QuickTestSessionSchema.index({ userId: 1, isComplete: 1, createdAt: -1 });
QuickTestSessionSchema.index({ chatSessionId: 1 });
