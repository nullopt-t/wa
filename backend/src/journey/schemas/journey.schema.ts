import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type JourneyDocument = Journey & Document;

@Schema({ _id: false })
export class JourneyResource {
  @Prop({ required: true, enum: ['article', 'video', 'book'] })
  resourceType: string;

  @Prop({ required: true, type: Types.ObjectId })
  resourceId: Types.ObjectId;

  @Prop({ default: false })
  isMandatory: boolean;

  @Prop({ default: 0 })
  order: number;
}

export const JourneyResourceSchema = SchemaFactory.createForClass(JourneyResource);

@Schema({ _id: false })
export class JourneyLevel {
  @Prop({ required: true })
  levelNumber: number;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ default: 0 })
  order: number;

  @Prop({ default: 0 })
  requiredCompletions: number;

  @Prop({ type: [JourneyResourceSchema], default: [] })
  resources: JourneyResource[];

  @Prop()
  color?: string;

  @Prop()
  icon?: string;
}

export const JourneyLevelSchema = SchemaFactory.createForClass(JourneyLevel);

@Schema({ timestamps: true })
export class Journey {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ default: '' })
  longDescription?: string;

  @Prop({ type: [JourneyLevelSchema], default: [] })
  levels: JourneyLevel[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  icon?: string;

  @Prop()
  color?: string;

  @Prop({ default: 0 })
  estimatedDuration: number; // in days
}

export const JourneySchema = SchemaFactory.createForClass(Journey);

// Ensure only one active journey can exist
JourneySchema.index({ isActive: 1 });
