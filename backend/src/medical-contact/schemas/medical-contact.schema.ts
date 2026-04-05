import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MedicalContactDocument = MedicalContact & Document;

@Schema({ timestamps: true })
export class MedicalContact {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true, enum: ['hospital', 'clinic', 'doctor'] })
  type: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  notes?: string;
}

export const MedicalContactSchema = SchemaFactory.createForClass(MedicalContact);
