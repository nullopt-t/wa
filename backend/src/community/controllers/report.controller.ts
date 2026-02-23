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
import { AuthGuard } from '@nestjs/passport';
import { ReportService } from '../services/report.service';
import { CreateReportDto, UpdateReportDto } from '../dto/report.dto';

@Controller('community/reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  // Create report (authenticated users)
  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(@Request() req, @Body() createReportDto: CreateReportDto) {
    const userId = req.user.userId;
    return this.reportService.create(userId, createReportDto);
  }

  // Get all reports (admin only - should add role guard)
  @Get()
  @UseGuards(AuthGuard('jwt'))
  async findAll(@Query('page') page = 1, @Query('status') status?: string) {
    return this.reportService.findAll(page, 20, status);
  }

  // Get reports for a specific target
  @Get('target/:targetType/:targetId')
  async getReportsForTarget(
    @Param('targetType') targetType: string,
    @Param('targetId') targetId: string,
  ) {
    return this.reportService.getReportsForTarget(targetType, targetId);
  }

  // Update report (admin only - should add role guard)
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
  @Get('stats/overview')
  @UseGuards(AuthGuard('jwt'))
  async getStatistics() {
    return this.reportService.getStatistics();
  }
}
