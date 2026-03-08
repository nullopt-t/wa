import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RedisCacheModule } from '../modules/redis-cache/redis-cache.module';
import { User, UserSchema } from './schemas/user.schema';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { ProfileController } from './profile.controller';
import { HashModule } from '../modules/hash/hash.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    RedisCacheModule,
    HashModule,
  ],
  controllers: [UserController, ProfileController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule { }