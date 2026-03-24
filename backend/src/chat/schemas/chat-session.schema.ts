import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ChatSessionDocument = ChatSession & Document;

export interface AssessmentState {
  isInAssessment: boolean;
  assessmentCode?: string;
  currentQuestionIndex?: number;
  answers?: Array<{
    questionId: Types.ObjectId;
    questionOrder: number;
    selectedValue: number;
    selectedText: string;
    selectedTextAr: string;
  }>;
  startedAt?: Date;
}

@Schema({ timestamps: true })
export class ChatSession {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ default: true, index: true })
  isActive: boolean;

  @Prop()
  endedAt?: Date;

  @Prop({ default: false })
  isExported: boolean;

  @Prop({ default: false })
  sharedWithTherapist: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  sharedWithTherapistId?: Types.ObjectId;

  @Prop({ default: 0 })
  messageCount: number;

  @Prop()
  lastMessageAt?: Date;

  @Prop({ type: {
    isInAssessment: Boolean,
    assessmentCode: String,
    currentQuestionIndex: Number,
    answers: [{
      questionId: Types.ObjectId,
      questionOrder: Number,
      selectedValue: Number,
      selectedText: String,
      selectedTextAr: String,
    }],
    startedAt: Date,
  } })
  assessmentState?: AssessmentState;
}

export const ChatSessionSchema = SchemaFactory.createForClass(ChatSession);

// Index for efficient querying
ChatSessionSchema.index({ userId: 1, isActive: 1, createdAt: -1 });
