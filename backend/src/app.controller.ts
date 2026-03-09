import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('env')
  getEnvVars(): object {
    return {
      PORT: process.env.PORT ? 'set' : 'NOT SET',
      DATABASE_URL: process.env.DATABASE_URL ? 'set' : 'NOT SET',
      NODE_ENV: process.env.NODE_ENV || 'NOT SET',
      JWT_SECRET: process.env.JWT_SECRET ? 'set' : 'NOT SET',
      GEMINI_API_KEY: process.env.GEMINI_API_KEY ? 'set' : 'NOT SET',
    };
  }
}