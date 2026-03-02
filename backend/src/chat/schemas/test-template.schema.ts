import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TestTemplateDocument = TestTemplate & Document;

// Define embedded schemas FIRST
@Schema({ _id: false })
export class TestOption {
  @Prop({ required: true })
  value: number;

  @Prop({ required: true })
  label: string;
}

@Schema({ _id: false })
export class TestQuestion {
  @Prop({ required: true })
  id: number;

  @Prop({ required: true })
  text: string;

  @Prop({ required: true, enum: ['single-choice', 'scale', 'multiple-choice'] })
  type: string;

  @Prop({ type: () => [TestOption] })
  options: TestOption[];

  @Prop({ default: true })
  required: boolean;
}

@Schema({ _id: false })
export class ScoreRange {
  @Prop({ required: true })
  min: number;

  @Prop({ required: true })
  max: number;

  @Prop({ required: true })
  level: string;

  @Prop({ required: true })
  color: string;

  @Prop()
  description: string;
}

@Schema({ _id: false })
export class ScoringConfig {
  @Prop({ type: () => [ScoreRange] })
  ranges: ScoreRange[];

  @Prop({ type: Object })
  suggestions: any;

  @Prop()
  disclaimer: string;
}

// Main schema
@Schema({ timestamps: true })
export class TestTemplate {
  @Prop({ required: true, unique: true })
  id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, index: true })
  category: string;

  @Prop({ type: () => [TestQuestion] })
  questions: TestQuestion[];

  @Prop({ type: () => ScoringConfig })
  scoring: ScoringConfig;

  @Prop({ default: 0 })
  timesTaken: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  tags: string[];

  @Prop({ default: 3 })
  durationMinutes: number;

  @Prop({ default: false })
  validated: boolean;

  @Prop()
  validationSource?: string;
}

export const TestTemplateSchema = SchemaFactory.createForClass(TestTemplate);

// Index for searching
TestTemplateSchema.index({ category: 1, isActive: 1 });
TestTemplateSchema.index({ tags: 1 });
