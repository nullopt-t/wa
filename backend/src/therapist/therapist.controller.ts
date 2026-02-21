import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TherapistService } from './therapist.service';

@Controller('therapist')
export class TherapistController {
  constructor(private readonly therapistService: TherapistService) {}

  @Get('dashboard')
  @UseGuards(AuthGuard('jwt'))
  async getDashboard(@Request() req) {
    const therapistId = req.user.userId;
    return this.therapistService.getDashboardData(therapistId);
  }

  @Get('stats')
  @UseGuards(AuthGuard('jwt'))
  async getStats(@Request() req) {
    const therapistId = req.user.userId;
    return this.therapistService.getTherapistStats(therapistId);
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@Request() req) {
    const therapistId = req.user.userId;
    return this.therapistService.getTherapistProfile(therapistId);
  }
}
