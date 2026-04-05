import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Journey, JourneyDocument } from '../schemas/journey.schema';
import {
  UserJourneyProgress,
  UserJourneyProgressDocument,
} from '../schemas/user-journey-progress.schema';
import {
  CreateJourneyDto,
  UpdateJourneyDto,
  CompleteResourceDto,
} from '../dto/journey.dto';

@Injectable()
export class JourneyService {
  constructor(
    @InjectModel(Journey.name) private journeyModel: Model<JourneyDocument>,
    @InjectModel(UserJourneyProgress.name)
    private progressModel: Model<UserJourneyProgressDocument>,
  ) {}

  // ==================== JOURNEY CRUD ====================

  async create(createDto: CreateJourneyDto): Promise<Journey> {
    // If this journey should be active, deactivate all others first
    if (createDto.isActive !== false) {
      await this.journeyModel.updateMany({}, { isActive: false });
    }
    const createdJourney = new this.journeyModel(createDto);
    return createdJourney.save();
  }

  async findAll(activeOnly = false): Promise<Journey[]> {
    const filter = activeOnly ? { isActive: true } : {};
    return this.journeyModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<Journey> {
    const journey = await this.journeyModel.findById(id).exec();
    if (!journey) {
      throw new NotFoundException('الرحلة غير موجودة');
    }
    return journey;
  }

  async findActive(): Promise<JourneyDocument> {
    const journey = await this.journeyModel.findOne({ isActive: true }).exec();
    if (!journey) {
      throw new NotFoundException('لا توجد رحلة نشطة حالياً');
    }
    return journey;
  }

  async update(id: string, updateDto: UpdateJourneyDto): Promise<Journey> {
    const updated = await this.journeyModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException('الرحلة غير موجودة');
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    const result = await this.journeyModel.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      throw new NotFoundException('الرحلة غير موجودة');
    }
  }

  // ==================== USER PROGRESS ====================

  async getProgress(userId: string, journeyId: string): Promise<UserJourneyProgress> {
    const progress = await this.progressModel
      .findOne({ userId: new Types.ObjectId(userId), journeyId: new Types.ObjectId(journeyId) })
      .exec();

    if (!progress) {
      throw new NotFoundException('لم يتم بدء الرحلة بعد');
    }

    return progress;
  }

  async getUserProgress(userId: string): Promise<UserJourneyProgress[]> {
    return this.progressModel.find({ userId: new Types.ObjectId(userId) }).exec();
  }

  async startJourney(userId: string, journeyId: string): Promise<UserJourneyProgress> {
    // Check if already started
    const existing = await this.progressModel.findOne({
      userId: new Types.ObjectId(userId),
      journeyId: new Types.ObjectId(journeyId),
    });

    if (existing) {
      throw new ConflictException('لقد بدأت هذه الرحلة بالفعل');
    }

    // Get journey to initialize levels
    const journey = await this.findOne(journeyId);

    // Create progress record
    const progress = new this.progressModel({
      userId: new Types.ObjectId(userId),
      journeyId: new Types.ObjectId(journeyId),
      currentLevel: 1,
      startedAt: new Date(),
      isCompleted: false,
      levelProgress: journey.levels.map((level) => ({
        levelNumber: level.levelNumber,
        isCompleted: false,
        completedResources: [],
        progressPercentage: 0,
      })),
      overallProgress: 0,
    });

    return progress.save();
  }

  async completeResource(
    userId: string,
    journeyId: string,
    levelNumber: number,
    completeResourceDto: CompleteResourceDto,
  ): Promise<UserJourneyProgress> {
    const progress = await this.progressModel.findOne({
      userId: new Types.ObjectId(userId),
      journeyId: new Types.ObjectId(journeyId),
    });

    if (!progress) {
      throw new NotFoundException('لم يتم بدء الرحلة بعد');
    }

    // Check if user is at this level
    if (progress.currentLevel < levelNumber) {
      throw new ConflictException('يجب إكمال المستويات السابقة أولاً');
    }

    // Find the level progress
    const levelProgress = progress.levelProgress.find(
      (lp) => lp.levelNumber === levelNumber,
    );

    if (!levelProgress) {
      throw new NotFoundException('المستوى غير موجود');
    }

    // Check if already completed
    const alreadyCompleted = levelProgress.completedResources.some(
      (cr) =>
        cr.resourceType === completeResourceDto.resourceType &&
        cr.resourceId.toString() === completeResourceDto.resourceId,
    );

    if (alreadyCompleted) {
      return progress; // Already completed, return as is
    }

    // Add completed resource
    levelProgress.completedResources.push({
      resourceType: completeResourceDto.resourceType,
      resourceId: new Types.ObjectId(completeResourceDto.resourceId),
      completedAt: new Date(),
    });

    levelProgress.startedAt = levelProgress.startedAt || new Date();

    // Calculate level progress
    await this.calculateLevelProgress(progress, levelNumber);

    return progress.save();
  }

  async completeLevel(
    userId: string,
    journeyId: string,
    levelNumber: number,
  ): Promise<UserJourneyProgress> {
    const progress = await this.progressModel.findOne({
      userId: new Types.ObjectId(userId),
      journeyId: new Types.ObjectId(journeyId),
    });

    if (!progress) {
      throw new NotFoundException('لم يتم بدء الرحلة بعد');
    }

    const levelProgress = progress.levelProgress.find(
      (lp) => lp.levelNumber === levelNumber,
    );

    if (!levelProgress) {
      throw new NotFoundException('المستوى غير موجود');
    }

    if (levelProgress.isCompleted) {
      return progress; // Already completed
    }

    // Get journey to check required completions
    const journey = await this.findActive();
    const level = journey.levels.find((l) => l.levelNumber === levelNumber);

    if (!level) {
      throw new NotFoundException('المستوى غير موجود في الرحلة');
    }

    // Check if enough resources are completed
    const mandatoryCount = level.resources.filter((r) => r.isMandatory).length;
    const requiredCompletions = mandatoryCount > 0 ? mandatoryCount : level.resources.length;

    if (levelProgress.completedResources.length < requiredCompletions) {
      throw new ConflictException(
        `يجب إكمال ${requiredCompletions} مورد على الأقل لإكمال هذا المستوى`,
      );
    }

    // Mark level as completed
    levelProgress.isCompleted = true;
    levelProgress.completedAt = new Date();

    // Update current level
    const nextLevel = levelNumber + 1;
    if (nextLevel <= 4) {
      progress.currentLevel = nextLevel;
      
      // Initialize next level if not already initialized
      const nextLevelProgress = progress.levelProgress.find(
        (lp) => lp.levelNumber === nextLevel,
      );
      if (!nextLevelProgress) {
        progress.levelProgress.push({
          levelNumber: nextLevel,
          startedAt: new Date(),
          isCompleted: false,
          completedResources: [],
          progressPercentage: 0,
        });
      }
    }

    // Calculate overall progress
    await this.calculateOverallProgress(progress);

    return progress.save();
  }

  // ==================== HELPER METHODS ====================

  private async calculateLevelProgress(
    progress: UserJourneyProgress,
    levelNumber: number,
  ): Promise<void> {
    const journey = await this.findActive();
    const level = journey.levels.find((l) => l.levelNumber === levelNumber);

    if (!level) return;

    const levelProgress = progress.levelProgress.find(
      (lp) => lp.levelNumber === levelNumber,
    );

    if (!levelProgress) return;

    const totalResources = level.resources.length;
    const completedResources = levelProgress.completedResources.length;

    levelProgress.progressPercentage =
      totalResources > 0 ? Math.round((completedResources / totalResources) * 100) : 0;

    // Auto-complete level if all mandatory resources are done
    const mandatoryResources = level.resources.filter((r) => r.isMandatory);
    const completedMandatory = levelProgress.completedResources.filter((cr) =>
      mandatoryResources.some(
        (mr) =>
          mr.resourceType === cr.resourceType &&
          mr.resourceId.toString() === cr.resourceId.toString(),
      ),
    );

    if (completedMandatory.length === mandatoryResources.length && mandatoryResources.length > 0) {
      if (!levelProgress.isCompleted) {
        levelProgress.isCompleted = true;
        levelProgress.completedAt = new Date();

        // Update current level
        const nextLevel = levelNumber + 1;
        if (nextLevel <= 4) {
          progress.currentLevel = nextLevel;
        }

        await this.calculateOverallProgress(progress);
      }
    }
  }

  private async calculateOverallProgress(
    progress: UserJourneyProgress,
  ): Promise<void> {
    const journey = await this.findActive();
    const totalLevels = journey.levels.length;

    if (totalLevels === 0) {
      progress.overallProgress = 0;
      return;
    }

    const completedLevels = progress.levelProgress.filter(
      (lp) => lp.isCompleted,
    ).length;

    progress.overallProgress = Math.round((completedLevels / totalLevels) * 100);

    // Check if journey is completed
    if (completedLevels === totalLevels && !progress.isCompleted) {
      progress.isCompleted = true;
      progress.completedAt = new Date();
    }
  }
}
