import { Controller, Get, Logger } from '@nestjs/common';
import { HealthCheckService, MongooseHealthIndicator, HealthCheck, HealthCheckResult, HealthIndicatorFunction } from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(
    private health: HealthCheckService,
    private db: MongooseHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  async check(): Promise<HealthCheckResult> {
    this.logger.log('Performing health check');

    const healthChecks: HealthIndicatorFunction[] = [
      async () => this.db.pingCheck('database'),
    ];

    const result = await this.health.check(healthChecks);
    this.logger.log('Health check completed', result);

    return result;
  }
}