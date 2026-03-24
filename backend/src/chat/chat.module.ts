import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { ChatController } from './controllers/chat.controller';
import { ChatService } from './services/chat.service';
import { GeminiAIService } from './services/gemini-ai.service';
import { EmotionAnalysisService } from './services/emotion-analysis.service';
import { QuickTestService } from './services/quick-test.service';
import { ChatGateway } from './gateways/chat.gateway';
import { ChatSession, ChatSessionSchema } from './schemas/chat-session.schema';
import { ChatMessage, ChatMessageSchema } from './schemas/chat-message.schema';
import { EmotionLog, EmotionLogSchema } from './schemas/emotion-log.schema';
import { TestResult, TestResultSchema } from './schemas/test-result.schema';
import { TestTemplate, TestTemplateSchema } from './schemas/test-template.schema';
import { QuickTestSession, QuickTestSessionSchema } from './schemas/quick-test-session.schema';
import { PDFModule } from '../modules/pdf/pdf.module';

@Module({
  imports: [
    ConfigModule,
    PDFModule,
    MongooseModule.forFeature([
      { name: ChatSession.name, schema: ChatSessionSchema },
      { name: ChatMessage.name, schema: ChatMessageSchema },
      { name: EmotionLog.name, schema: EmotionLogSchema },
      { name: TestResult.name, schema: TestResultSchema },
      { name: TestTemplate.name, schema: TestTemplateSchema },
      { name: QuickTestSession.name, schema: QuickTestSessionSchema },
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [ChatController],
  providers: [ChatService, GeminiAIService, EmotionAnalysisService, QuickTestService, ChatGateway],
  exports: [ChatService, GeminiAIService, EmotionAnalysisService, QuickTestService, ChatGateway],
})
export class ChatModule {}
