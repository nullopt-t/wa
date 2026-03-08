import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL');
        const redisHost = configService.get<string>('REDIS_HOST');
        
        // If no Redis configured, use in-memory cache
        if (!redisUrl && !redisHost) {
          console.log('⚠️  No Redis configured, using in-memory cache');
          return {
            ttl: 60000, // 1 minute
            max: 100,   // 100 items
          };
        }
        
        console.log('✅ Using Redis cache');
        return {
          store: redisStore as any,
          host: redisHost ?? 'redis',
          port: configService.get<number>('REDIS_PORT') ?? 6379,
          password: configService.get<string>('REDIS_PASSWORD'),
          ttl: 600,
        };
      },
      inject: [ConfigService],
    }),
  ],
  exports: [CacheModule],
})
export class RedisCacheModule { }