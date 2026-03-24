import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AssessmentController } from './controllers/assessment.controller';
import { AssessmentService } from './services/assessment.service';
import { Assessment, AssessmentSchema } from './schemas/assessment.schema';
import { AssessmentQuestion, AssessmentQuestionSchema } from './schemas/assessment-question.schema';
import { AssessmentResult, AssessmentResultSchema } from './schemas/assessment-result.schema';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Assessment', schema: AssessmentSchema },
      { name: 'AssessmentQuestion', schema: AssessmentQuestionSchema },
      { name: 'AssessmentResult', schema: AssessmentResultSchema },
    ]),
    ChatModule,
  ],
  controllers: [AssessmentController],
  providers: [AssessmentService],
  exports: [AssessmentService],
})
export class AssessmentModule {}
