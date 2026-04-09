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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiOkResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { MedicalContactService } from '../services/medical-contact.service';
import { CreateMedicalContactDto, UpdateMedicalContactDto } from '../dto/medical-contact.dto';

@ApiTags('جهات الاتصال الطبية')
@Controller('medical-contacts')
export class MedicalContactController {
  constructor(private readonly medicalContactService: MedicalContactService) {}

  /**
   * Public: Get all active medical contacts
   */
  @ApiOperation({ summary: 'عرض جهات الاتصال الطبية (عام)' })
  @ApiOkResponse({ description: 'قائمة جهات الاتصال', schema: { type: 'array', items: { type: 'object' } } })
  @Get()
  async getPublicContacts(
    @Query('type') type?: string,
    @Query('search') search?: string,
  ) {
    const data = await this.medicalContactService.findPublic(type, search);
    return {
      success: true,
      data,
    };
  }

  /**
   * Admin: Get all medical contacts with pagination
   */
  @ApiOperation({ summary: 'عرض جميع جهات الاتصال (إدارة)' })
  @ApiOkResponse({ description: 'قائمة جهات الاتصال', schema: { type: 'array', items: { type: 'object' } } })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @ApiResponse({ status: 403, description: 'ممنوع - للمسؤولين فقط' })
  @Get('admin')
  @UseGuards(AuthGuard('jwt'))
  async getAllContacts(
    @Request() req,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 20,
    @Query('type') type?: string,
    @Query('search') search?: string,
  ) {
    if (req.user.role !== 'admin') {
      return { success: false, message: 'غير مصرح' };
    }

    const result = await this.medicalContactService.findAll(page, limit, type, search);
    return {
      success: true,
      data: result.data,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(result.total / limit),
        total: result.total,
      },
    };
  }

  /**
   * Admin: Get stats
   */
  @ApiOperation({ summary: 'إحصائيات جهات الاتصال' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @ApiResponse({ status: 403, description: 'ممنوع - للمسؤولين فقط' })
  @Get('admin/stats')
  @UseGuards(AuthGuard('jwt'))
  async getStats(@Request() req) {
    if (req.user.role !== 'admin') {
      return { success: false, message: 'غير مصرح' };
    }

    const stats = await this.medicalContactService.getStats();
    return {
      success: true,
      data: stats,
    };
  }

  /**
   * Admin: Get by ID
   */
  @ApiOperation({ summary: 'عرض جهة اتصال بالرقم (إدارة)' })
  @ApiOkResponse({ description: 'تفاصيل الجهة' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @ApiResponse({ status: 403, description: 'ممنوع - للمسؤولين فقط' })
  @ApiResponse({ status: 404, description: 'غير موجودة' })
  @Get('admin/:id')
  @UseGuards(AuthGuard('jwt'))
  async getById(@Request() req, @Param('id') id: string) {
    if (req.user.role !== 'admin') {
      return { success: false, message: 'غير مصرح' };
    }

    const contact = await this.medicalContactService.findById(id);
    return {
      success: true,
      data: contact,
    };
  }

  /**
   * Admin: Create
   */
  @ApiOperation({ summary: 'إضافة جهة اتصال (إدارة)' })
  @ApiOkResponse({ description: 'تمت الإضافة' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 400, description: 'بيانات غير صالحة' })
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @ApiResponse({ status: 403, description: 'ممنوع - للمسؤولين فقط' })
  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(
    @Body() createDto: CreateMedicalContactDto,
    @Request() req,
  ) {
    if (req.user.role !== 'admin') {
      return { success: false, message: 'غير مصرح' };
    }

    const contact = await this.medicalContactService.create(createDto);
    return {
      success: true,
      message: 'تمت إضافة جهة الاتصال بنجاح',
      data: contact,
    };
  }

  /**
   * Admin: Update
   */
  @ApiOperation({ summary: 'تحديث جهة اتصال (إدارة)' })
  @ApiOkResponse({ description: 'تم التحديث' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 400, description: 'بيانات غير صالحة' })
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @ApiResponse({ status: 403, description: 'ممنوع - للمسؤولين فقط' })
  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateMedicalContactDto,
    @Request() req,
  ) {
    if (req.user.role !== 'admin') {
      return { success: false, message: 'غير مصرح' };
    }

    const contact = await this.medicalContactService.update(id, updateDto);
    return {
      success: true,
      message: 'تم تحديث جهة الاتصال بنجاح',
      data: contact,
    };
  }

  /**
   * Admin: Delete
   */
  @ApiOperation({ summary: 'حذف جهة اتصال (إدارة)' })
  @ApiOkResponse({ description: 'تم الحذف' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @ApiResponse({ status: 403, description: 'ممنوع - للمسؤولين فقط' })
  @ApiResponse({ status: 404, description: 'غير موجودة' })
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async delete(@Request() req, @Param('id') id: string) {
    if (req.user.role !== 'admin') {
      return { success: false, message: 'غير مصرح' };
    }

    await this.medicalContactService.delete(id);
    return {
      success: true,
      message: 'تم حذف جهة الاتصال بنجاح',
    };
  }

  /**
   * Admin: Bulk Delete
   */
  @ApiOperation({ summary: 'حذف متعدد (إدارة)' })
  @ApiOkResponse({ description: 'تم الحذف' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @ApiResponse({ status: 403, description: 'ممنوع - للمسؤولين فقط' })
  @Post('admin/bulk-delete')
  @UseGuards(AuthGuard('jwt'))
  async bulkDelete(
    @Request() req,
    @Body('ids') ids: string[],
  ) {
    if (req.user.role !== 'admin') {
      return { success: false, message: 'غير مصرح' };
    }

    if (!Array.isArray(ids) || ids.length === 0) {
      return { success: false, message: 'معرفات غير صالحة' };
    }

    await this.medicalContactService.deleteMany(ids);
    return {
      success: true,
      message: `تم حذف ${ids.length} جهة اتصال بنجاح`,
    };
  }
}
