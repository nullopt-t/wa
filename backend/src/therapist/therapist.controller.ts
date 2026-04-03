import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TherapistService } from './therapist.service';

@Controller('therapists')
export class TherapistController {
  constructor(private readonly therapistService: TherapistService) {}

  /**
   * Public: Get all therapists (with filters)
   */
  @Get()
  async findAll(@Query() query: any) {
    return this.therapistService.findAll(query);
  }

  /**
   * Therapist: Get dashboard (MUST be before :id route!)
   */
  @Get('dashboard')
  @UseGuards(AuthGuard('jwt'))
  async getDashboard(@Request() req) {
    const therapistId = req.user.userId;
    return this.therapistService.getDashboardData(therapistId);
  }

  /**
   * Public: Get therapist by ID
   */
  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.therapistService.findById(id);
  }

  /**
   * Therapist: Get own profile
   */
  @Get('profile/me')
  @UseGuards(AuthGuard('jwt'))
  async getOwnProfile(@Request() req) {
    const userId = req.user.userId;
    return this.therapistService.findById(userId);
  }

  /**
   * Therapist: Create profile
   */
  @Post('profile')
  @UseGuards(AuthGuard('jwt'))
  async createProfile(@Request() req, @Body() profileData: any) {
    const userId = req.user.userId;
    return this.therapistService.createProfile(userId, profileData);
  }

  /**
   * Therapist: Update profile
   */
  @Patch('profile')
  @UseGuards(AuthGuard('jwt'))
  async updateProfile(@Request() req, @Body() updateData: any) {
    const userId = req.user.userId;
    return this.therapistService.update(userId, updateData);
  }

  /**
   * Therapist: Submit verification
   */
  @Post('profile/verify')
  @UseGuards(AuthGuard('jwt'))
  async submitVerification(@Request() req, @Body() data: { licenseImage: string }) {
    const userId = req.user.userId;
    return this.therapistService.submitVerification(userId, data.licenseImage);
  }

  /**
   * Therapist: Delete profile
   */
  @Delete('profile')
  @UseGuards(AuthGuard('jwt'))
  async deleteProfile(@Request() req) {
    const userId = req.user.userId;
    return this.therapistService.delete(userId);
  }

  // ==================== ADMIN ENDPOINTS ====================

  /**
   * Admin: Get all therapists (including unverified/unapproved)
   */
  @Get('admin/all')
  @UseGuards(AuthGuard('jwt'))
  async findAllForAdmin(
    @Request() req,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 50,
    @Query('status') status?: string,
  ) {
    // Check if admin
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Only admins can view all therapists');
    }

    const filters: any = { page, limit };
    if (status) {
      filters.isVerified = status === 'verified';
    }
    return this.therapistService.findAll(filters, true);
  }

  /**
   * Admin: Get pending therapists (email verified, awaiting approval)
   */
  @Get('admin/pending')
  @UseGuards(AuthGuard('jwt'))
  async findPendingForAdmin(@Request() req) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Only admins can view pending therapists');
    }
    return this.therapistService.findPendingTherapists();
  }

  /**
   * Admin: Verify therapist
   */
  @Patch(':id/verify')
  @UseGuards(AuthGuard('jwt'))
  async verifyTherapist(@Request() req, @Param('id') therapistId: string) {
    // Check if admin
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Only admins can verify therapists');
    }
    
    const adminId = req.user.userId;
    return this.therapistService.verifyTherapist(adminId, therapistId);
  }

  /**
   * Admin: Approve therapist
   */
  @Patch(':id/approve')
  @UseGuards(AuthGuard('jwt'))
  async approveTherapist(@Request() req, @Param('id') therapistId: string) {
    // Check if admin
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Only admins can approve therapists');
    }
    
    const adminId = req.user.userId;
    return this.therapistService.approveTherapist(adminId, therapistId);
  }
}
