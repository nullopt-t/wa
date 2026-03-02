import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TestResultDocument = TestResult & Document;

// Define embedded schemas FIRST (before main schema)
@Schema({ _id: false })
export class TestAnswer {
  @Prop({ required: true })
  questionId: number;

  @Prop()
  questionText: string;

  @Prop({ required: true })
  selectedValue: number;

  @Prop()
  selectedLabel: string;
}

@Schema({ _id: false })
export class TestScore {
  @Prop({ required: true })
  total: number;

  @Prop({ required: true })
  maxScore: number;

  @Prop()
  percentage: number;

  @Prop()
  level: string;

  @Prop()
  color: string;

  @Prop()
  description: string;
}

// Main schema
@Schema({ timestamps: true })
export class TestResult {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, index: true })
  testId: string;

  @Prop({ required: true })
  testName: string;

  @Prop({ required: true })
  completedAt: Date;

  @Prop({ type: () => [TestAnswer] })
  answers: TestAnswer[];

  @Prop({ type: () => TestScore })
  score: TestScore;

  @Prop()
  suggestions: string[];

  @Prop({ default: false })
  sharedWithTherapist: boolean;

  @Prop({ type: Types.ObjectId, ref: 'ChatSession' })
  sessionId?: Types.ObjectId;

  @Prop()
  aiInterpretation?: string;
}

export const TestResultSchema = SchemaFactory.createForClass(TestResult);

// Indexes
TestResultSchema.index({ userId: 1, completedAt: -1 });
TestResultSchema.index({ testId: 1, userId: 1 });
