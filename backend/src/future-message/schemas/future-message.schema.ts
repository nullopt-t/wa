import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FutureMessageDocument = FutureMessage & Document;

@Schema({ timestamps: true })
export class FutureMessage {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, maxlength: 5000 })
  message: string;

  @Prop({ required: true })
  deliverAt: Date;

  @Prop({ default: false })
  isDelivered: boolean;

  @Prop()
  deliveredAt?: Date;

  @Prop({ maxlength: 500 })
  title?: string;

  @Prop({ default: false })
  isEmailNotification: boolean;

  @Prop()
  recipientEmail?: string;
}

export const FutureMessageSchema = SchemaFactory.createForClass(FutureMessage);

// Index for efficient querying of pending messages
FutureMessageSchema.index({ isDelivered: 1, deliverAt: 1 });
FutureMessageSchema.index({ userId: 1, isDelivered: 1 });
