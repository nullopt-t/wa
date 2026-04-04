import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ChatMessageDocument = ChatMessage & Document;

@Schema({ timestamps: true })
export class ChatMessage {
  @Prop({ type: Types.ObjectId, ref: 'ChatSession', required: true, index: true })
  sessionId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, enum: ['user', 'assistant', 'system'] })
  role: string;

  @Prop({ required: true, type: String })
  content: string;

  @Prop({ type: String, enum: ['text', 'emotion', 'crisis', 'clinical-report'], default: 'text' })
  messageType: string;

  @Prop()
  emotions?: EmotionData[];

  @Prop()
  suggestions?: string[];

  @Prop({ type: Object })
  quickTest?: {
    title: string;
    titleAr: string;
    questions: string[];
    questionsAr: string[];
  };

  @Prop({ type: [{
    code: String,
    nameAr: String,
    reason: String,
  }] })
  assessmentSuggestions?: Array<{
    code: string;
    nameAr: string;
    reason?: string;
  }>;

  @Prop({ type: Object })
  reportData?: {
    symptoms: string[];
    duration: string;
    impact: { work: string; sleep: string; relationships: string };
    riskFactors: string[];
    severity: string;
    recommendations: string[];
  };

  @Prop({ type: [{
    _id: String,
    type: String,
    title: String,
    excerpt: String,
    url: String,
  }] })
  relatedResources?: Array<{
    _id: string;
    type: string;
    title: string;
    excerpt: string;
    url: string;
  }>;

  @Prop({ default: false })
  isCrisisMessage: boolean;

  @Prop()
  crisisResources?: CrisisResource[];
}

@Schema({ _id: false })
export class EmotionData {
  @Prop({ required: true })
  emotion: string;

  @Prop({ required: true, min: 0, max: 1 })
  confidence: number;

  @Prop({ required: true, min: 1, max: 10 })
  intensity: number;
}

@Schema({ _id: false })
export class CrisisResource {
  @Prop()
  name: string;

  @Prop()
  phone: string;

  @Prop()
  description: string;
}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);

// Indexes for efficient querying
ChatMessageSchema.index({ sessionId: 1, createdAt: 1 });
ChatMessageSchema.index({ userId: 1, createdAt: -1 });
