import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SessionDocument = Session & Document;

@Schema({ timestamps: true })
export class Session {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  therapistId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  clientId: Types.ObjectId;

  @Prop({ required: true })
  dateTime: Date;

  @Prop({ required: true, default: 60 })
  duration: number; // minutes

  @Prop({ 
    type: String, 
    enum: ['individual', 'couple', 'family', 'group', 'follow-up'],
    default: 'individual'
  })
  type: string;

  @Prop({ 
    type: String, 
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'],
    default: 'pending'
  })
  status: string;

  @Prop()
  notes?: string;

  @Prop()
  clientNotes?: string;

  @Prop([String])
  goals?: string[];

  @Prop([String])
  homework?: string[];

  @Prop({ required: true, default: 0 })
  price: number;

  @Prop({ 
    type: String, 
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  })
  paymentStatus: string;

  @Prop()
  paymentMethod?: string;

  @Prop()
  cancellationReason?: string;

  @Prop({ type: Types.ObjectId })
  cancelledBy?: Types.ObjectId;

  @Prop()
  cancelledAt?: Date;

  @Prop()
  completedAt?: Date;

  @Prop([String])
  attachments?: string[];

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy?: Types.ObjectId;
}

export const SessionSchema = SchemaFactory.createForClass(Session);

// Index for efficient queries
SessionSchema.index({ therapistId: 1, dateTime: -1 });
SessionSchema.index({ clientId: 1, dateTime: -1 });
SessionSchema.index({ status: 1 });
