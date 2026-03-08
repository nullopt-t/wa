import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StoryController } from './controllers/story.controller';
import { StoryService } from './services/story.service';
import { Story, StorySchema } from './schemas/story.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Story.name, schema: StorySchema },
    ]),
  ],
  controllers: [StoryController],
  providers: [StoryService],
  exports: [StoryService],
})
export class StoryModule {}
