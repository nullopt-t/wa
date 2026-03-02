import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EmotionLogDocument = EmotionLog & Document;

@Schema({ timestamps: true })
export class EmotionLog {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, index: true })
  date: Date;

  @Prop()
  emotions: EmotionSummary[];

  @Prop({ enum: ['positive', 'neutral', 'negative', 'mixed'] })
  overallMood: string;

  @Prop({ default: 0 })
  sessionCount: number;

  @Prop()
  dominantEmotion?: string;
}

@Schema({ _id: false })
export class EmotionSummary {
  @Prop({ required: true })
  emotion: string;

  @Prop({ required: true, min: 0, max: 1 })
  averageConfidence: number;

  @Prop({ required: true, min: 1, max: 10 })
  averageIntensity: number;

  @Prop({ required: true, min: 0 })
  frequency: number;
}

export const EmotionLogSchema = SchemaFactory.createForClass(EmotionLog);

// Index for efficient querying by date range
EmotionLogSchema.index({ userId: 1, date: -1 });
