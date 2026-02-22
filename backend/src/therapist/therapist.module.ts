import { Module } from '@nestjs/common';
import { TherapistController } from './therapist.controller';
import { TherapistService } from './therapist.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Session, SessionSchema } from '../sessions/schemas/session.schema';
import { SessionsModule } from '../sessions/sessions.module';

@Module({
  imports: [
    SessionsModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: 'Session', schema: SessionSchema },
    ]),
  ],
  controllers: [TherapistController],
  providers: [TherapistService],
  exports: [TherapistService],
})
export class TherapistModule {}
