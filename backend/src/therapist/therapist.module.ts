import { Module } from '@nestjs/common';
import { TherapistController } from './therapist.controller';
import { TherapistService } from './therapist.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/schemas/user.schema';
import { TherapistProfile, TherapistProfileSchema } from './schemas/therapist-profile.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: TherapistProfile.name, schema: TherapistProfileSchema },
    ]),
  ],
  controllers: [TherapistController],
  providers: [TherapistService],
  exports: [TherapistService],
})
export class TherapistModule {}
