import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserJourneyProgressDocument = UserJourneyProgress & Document;

@Schema({ _id: false })
export class CompletedResource {
  @Prop({ required: true })
  resourceType: string;

  @Prop({ required: true, type: Types.ObjectId })
  resourceId: Types.ObjectId;

  @Prop({ required: true })
  completedAt: Date;
}

export const CompletedResourceSchema = SchemaFactory.createForClass(CompletedResource);

@Schema({ _id: false })
export class LevelProgress {
  @Prop({ required: true })
  levelNumber: number;

  @Prop()
  startedAt?: Date;

  @Prop()
  completedAt?: Date;

  @Prop({ default: false })
  isCompleted: boolean;

  @Prop({ type: [CompletedResourceSchema], default: [] })
  completedResources: CompletedResource[];

  @Prop({ default: 0 })
  progressPercentage: number;
}

export const LevelProgressSchema = SchemaFactory.createForClass(LevelProgress);

@Schema({ timestamps: true })
export class UserJourneyProgress {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Journey' })
  journeyId: Types.ObjectId;

  @Prop({ default: 1 })
  currentLevel: number;

  @Prop()
  startedAt?: Date;

  @Prop()
  completedAt?: Date;

  @Prop({ default: false })
  isCompleted: boolean;

  @Prop({ type: [LevelProgressSchema], default: [] })
  levelProgress: LevelProgress[];

  @Prop({ default: 0 })
  overallProgress: number;
}

export const UserJourneyProgressSchema = SchemaFactory.createForClass(UserJourneyProgress);

// Compound index to ensure one progress record per user per journey
UserJourneyProgressSchema.index({ userId: 1, journeyId: 1 }, { unique: true });

// Index for efficient queries
UserJourneyProgressSchema.index({ userId: 1 });
UserJourneyProgressSchema.index({ journeyId: 1 });
