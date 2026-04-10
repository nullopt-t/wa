import { Module, OnModuleInit } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { ChatController } from './controllers/chat.controller';
import { ChatService } from './services/chat.service';
import { GeminiProvider } from './services/gemini-ai.service';
import { GroqProvider } from './services/groq-ai.service';
import { ChatGateway } from './gateways/chat.gateway';
import { ChatSession, ChatSessionSchema } from './schemas/chat-session.schema';
import { ChatMessage, ChatMessageSchema } from './schemas/chat-message.schema';
import { EmotionLog, EmotionLogSchema } from './schemas/emotion-log.schema';
import { Article, ArticleSchema } from '../article/schemas/article.schema';
import { Video, VideoSchema } from '../video/schemas/video.schema';
import { PDFModule } from '../modules/pdf/pdf.module';
import { AIProviderFactory } from './services/ai-provider.factory';
import { IAIProvider } from './services/ai-provider.interface';

/**
 * Factory provider that returns the active AI provider based on configuration.
 */
export const aiProviderFactory = {
  provide: 'IAIProvider',
  useFactory: (geminiProvider: GeminiProvider, groqProvider: GroqProvider): IAIProvider => {
    AIProviderFactory.initialize(geminiProvider, groqProvider);
    return AIProviderFactory.getProvider();
  },
  inject: [GeminiProvider, GroqProvider],
};

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
  providers: [
    ChatService,
    GeminiProvider,
    GroqProvider,
    ChatGateway,
    aiProviderFactory,
  ],
  exports: [ChatService, ChatGateway, aiProviderFactory],
})
export class ChatModule implements OnModuleInit {
  onModuleInit() {
    // Log which provider is active on module init
    try {
      const provider = AIProviderFactory.getProvider();
      console.log(`[ChatModule] Active AI provider: ${provider.getName()}`);
    } catch (error) {
      console.warn('[ChatModule] No AI provider available:', error.message);
    }
  }
}
