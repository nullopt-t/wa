import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { ChatController } from './controllers/chat.controller';
import { ChatService } from './services/chat.service';
import { GeminiAIService } from './services/gemini-ai.service';
import { EmotionAnalysisService } from './services/emotion-analysis.service';
import { ChatGateway } from './gateways/chat.gateway';
import { ChatSession, ChatSessionSchema } from './schemas/chat-session.schema';
import { ChatMessage, ChatMessageSchema } from './schemas/chat-message.schema';
import { EmotionLog, EmotionLogSchema } from './schemas/emotion-log.schema';
import { Article, ArticleSchema } from '../article/schemas/article.schema';
import { Video, VideoSchema } from '../video/schemas/video.schema';
import { PDFModule } from '../modules/pdf/pdf.module';

@Module({
  imports: [
    ConfigModule,
    PDFModule,
    MongooseModule.forFeature([
      { name: ChatSession.name, schema: ChatSessionSchema },
      { name: ChatMessage.name, schema: ChatMessageSchema },
      { name: EmotionLog.name, schema: EmotionLogSchema },
      { name: Article.name, schema: ArticleSchema },
      { name: Video.name, schema: VideoSchema },
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [ChatController],
  providers: [ChatService, GeminiAIService, EmotionAnalysisService, ChatGateway],
  exports: [ChatService, GeminiAIService, EmotionAnalysisService, ChatGateway],
})
export class ChatModule {}
