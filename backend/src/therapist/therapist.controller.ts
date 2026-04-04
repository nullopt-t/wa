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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiOkResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TherapistService } from './therapist.service';

@ApiTags('المعالجين')
@Controller('therapists')
export class TherapistController {
  constructor(private readonly therapistService: TherapistService) {}

  /**
   * Public: Get all therapists (with filters)
   */
  @ApiOperation({ summary: 'عرض جميع المعالجين' })
  @ApiOkResponse({ description: 'قائمة البيانات', schema: { type: 'array', items: { type: 'object' } } })
  @Get()
  async findAll(@Query() query: any) {
    return this.therapistService.findAll(query);
  }

  /**
   * Therapist: Get dashboard (MUST be before :id route!)
   */
  @ApiOperation({ summary: 'عرض لوحة التحكم' })
  @ApiOkResponse({ description: 'بيانات لوحة التحكم' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @Get('dashboard')
  @UseGuards(AuthGuard('jwt'))
  async getDashboard(@Request() req) {
    const therapistId = req.user.userId;
    return this.therapistService.getDashboardData(therapistId);
  }

  /**
   * Public: Get therapist by ID
   */
  @ApiOperation({ summary: 'عرض معالج بالرقم' })
  @ApiOkResponse({ description: 'تفاصيل العنصر' })
  @ApiResponse({ status: 404, description: 'المعالج غير موجود' })
  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.therapistService.findById(id);
  }

  /**
   * Therapist: Get own profile
   */
  @ApiOperation({ summary: 'عرض الملف الشخصي للمعالج' })
  @ApiOkResponse({ description: 'الملف الشخصي' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @ApiResponse({ status: 404, description: 'الملف غير موجود' })
  @Get('profile/me')
  @UseGuards(AuthGuard('jwt'))
  async getOwnProfile(@Request() req) {
    const userId = req.user.userId;
    return this.therapistService.findById(userId);
  }

  /**
   * Therapist: Create profile
   */
  @ApiOperation({ summary: 'إنشاء ملف المعالج' })
  @ApiOkResponse({ description: 'تم الإنشاء بنجاح' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 400, description: 'بيانات غير صالحة' })
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @ApiResponse({ status: 409, description: 'الملف موجود مسبقاً' })
  @Post('profile')
  @UseGuards(AuthGuard('jwt'))
  async createProfile(@Request() req, @Body() profileData: any) {
    const userId = req.user.userId;
    return this.therapistService.createProfile(userId, profileData);
  }

  /**
   * Therapist: Update profile
   */
  @ApiOperation({ summary: 'تحديث ملف المعالج' })
  @ApiOkResponse({ description: 'تم التحديث بنجاح' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 400, description: 'بيانات غير صالحة' })
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @ApiResponse({ status: 404, description: 'الملف غير موجود' })
  @Patch('profile')
  @UseGuards(AuthGuard('jwt'))
  async updateProfile(@Request() req, @Body() updateData: any) {
    const userId = req.user.userId;
    return this.therapistService.update(userId, updateData);
  }

  /**
   * Therapist: Submit verification
   */
  @ApiOperation({ summary: 'إرسال طلب التحقق' })
  @ApiOkResponse({ description: 'تم الإرسال بنجاح' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 400, description: 'بيانات غير صالحة' })
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @Post('profile/verify')
  @UseGuards(AuthGuard('jwt'))
  async submitVerification(@Request() req, @Body() data: { licenseImage: string }) {
    const userId = req.user.userId;
    return this.therapistService.submitVerification(userId, data.licenseImage);
  }

  /**
   * Therapist: Delete profile
   */
  @ApiOperation({ summary: 'حذف ملف المعالج' })
  @ApiOkResponse({ description: 'تم الحذف بنجاح' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @ApiResponse({ status: 404, description: 'الملف غير موجود' })
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
  @ApiOperation({ summary: 'عرض جميع المعالجين (إدارة)' })
  @ApiOkResponse({ description: 'قائمة البيانات', schema: { type: 'array', items: { type: 'object' } } })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @ApiResponse({ status: 403, description: 'ممنوع - للمسؤولين فقط' })
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
  @ApiOperation({ summary: 'عرض المعالجين المعلقين' })
  @ApiOkResponse({ description: 'قائمة البيانات', schema: { type: 'array', items: { type: 'object' } } })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @ApiResponse({ status: 403, description: 'ممنوع - للمسؤولين فقط' })
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
  @ApiOperation({ summary: 'توثيق معالج' })
  @ApiOkResponse({ description: 'تم بنجاح' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @ApiResponse({ status: 403, description: 'ممنوع - للمسؤولين فقط' })
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
  @ApiOperation({ summary: 'موافقة على معالج' })
  @ApiOkResponse({ description: 'تم بنجاح' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @ApiResponse({ status: 403, description: 'ممنوع - للمسؤولين فقط' })
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
