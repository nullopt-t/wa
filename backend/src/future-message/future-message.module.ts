import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FutureMessageController } from './controllers/future-message.controller';
import { FutureMessageService } from './services/future-message.service';
import { FutureMessage, FutureMessageSchema } from './schemas/future-message.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FutureMessage.name, schema: FutureMessageSchema },
    ]),
  ],
  controllers: [FutureMessageController],
  providers: [FutureMessageService],
  exports: [FutureMessageService],
})
export class FutureMessageModule {}
