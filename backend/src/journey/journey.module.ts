import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JourneyController } from './controllers/journey.controller';
import { JourneyService } from './services/journey.service';
import { Journey, JourneySchema } from './schemas/journey.schema';
import {
  UserJourneyProgress,
  UserJourneyProgressSchema,
} from './schemas/user-journey-progress.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Journey.name, schema: JourneySchema },
      { name: UserJourneyProgress.name, schema: UserJourneyProgressSchema },
    ]),
  ],
  controllers: [JourneyController],
  providers: [JourneyService],
  exports: [JourneyService],
})
export class JourneyModule {}
