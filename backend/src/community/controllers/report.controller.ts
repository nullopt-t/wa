import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
  Request,
  Query
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiOkResponse, ApiProperty } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ReportService } from '../services/report.service';
import { CreateReportDto, UpdateReportDto } from '../dto/report.dto';

export class ReportStatsDto {
  @ApiProperty({ description: 'إجمالي البلاغات' })
  total: number;

  @ApiProperty({ description: 'قيد المراجعة' })
  pending: number;

  @ApiProperty({ description: 'تمت المراجعة' })
  reviewed: number;

  @ApiProperty({ description: 'تم الحل' })
  resolved: number;

  @ApiProperty({ description: 'تم الرفض' })
  dismissed: number;

  @ApiProperty({ description: 'حسب السبب', type: 'array' })
  byReason: any[];
}

@ApiTags('البلاغات')
@Controller('community/reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  // Create report (authenticated users)
  @ApiOperation({ summary: 'إنشاء بلاغ' })
  @ApiOkResponse({ description: 'تم الإبلاغ' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 400, description: 'بيانات غير صالحة' })
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(@Request() req, @Body() createReportDto: CreateReportDto) {
    const userId = req.user.userId;
    return this.reportService.create(userId, createReportDto);
  }

  // Get all reports (admin only - should add role guard)
  @ApiOperation({ summary: 'عرض جميع البلاغات (إدارة)' })
  @ApiOkResponse({ description: 'قائمة البيانات', schema: { type: 'array', items: { type: 'object' } } })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @Get()
  @UseGuards(AuthGuard('jwt'))
  async findAll(@Query('page') page = 1, @Query('status') status?: string) {
    return this.reportService.findAll(page, 20, status);
  }

  // Get reports for a specific target
  @ApiOperation({ summary: 'عرض بلاغات هدف معين' })
  @ApiOkResponse({ description: 'قائمة البيانات', schema: { type: 'array', items: { type: 'object' } } })
  @Get('target/:targetType/:targetId')
  async getReportsForTarget(
    @Param('targetType') targetType: string,
    @Param('targetId') targetId: string,
  ) {
    return this.reportService.getReportsForTarget(targetType, targetId);
  }

  // Update report (admin only - should add role guard)
  @ApiOperation({ summary: 'تحديث بلاغ (إدارة)' })
  @ApiOkResponse({ description: 'تم التحديث بنجاح' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 400, description: 'بيانات غير صالحة' })
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @ApiResponse({ status: 404, description: 'البلاغ غير موجود' })
  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateReportDto: UpdateReportDto,
  ) {
    const userId = req.user.userId;
    return this.reportService.update(userId, id, updateReportDto);
  }

  // Get report statistics (admin only)
  @ApiOperation({ summary: 'إحصائيات البلاغات' })
  @ApiBearerAuth('access-token')
  @ApiOkResponse({ type: ReportStatsDto, description: 'إحصائيات البلاغات' })
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @Get('stats/overview')
  @UseGuards(AuthGuard('jwt'))
  async getStatistics() {
    return this.reportService.getStatistics();
  }
}
