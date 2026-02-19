import { Controller, Get, Logger, Inject } from '@nestjs/common';
import { HealthCheckService, MongooseHealthIndicator, HealthCheck, HealthCheckResult, HealthIndicatorFunction } from '@nestjs/terminus';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(
    private health: HealthCheckService,
    private db: MongooseHealthIndicator,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Get()
  @HealthCheck()
  async check(): Promise<HealthCheckResult> {
    this.logger.log('Performing health check');
    
    const healthChecks: HealthIndicatorFunction[] = [
      async () => this.db.pingCheck('database'),
      async () => {
        try {
          // Test Redis connectivity by attempting to get/set a key
          const testKey = 'health_check_' + Date.now();
          await this.cacheManager.set(testKey, 'test', 1000); // Set for 1 second
          const value = await this.cacheManager.get(testKey);
          await this.cacheManager.del(testKey); // Clean up
          
          if (value === 'test') {
            return { redis: { status: 'up' } };
          } else {
            return { redis: { status: 'down', message: 'Unexpected response from Redis' } };
          }
        } catch (error) {
          return { redis: { status: 'down', message: error.message } };
        }
      },
    ];

    const result = await this.health.check(healthChecks);
    this.logger.log('Health check completed', result);
    
    return result;
  }
}