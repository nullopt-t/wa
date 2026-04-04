import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Request,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiOkResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FutureMessageService } from '../services/future-message.service';
import { CreateFutureMessageDto, UpdateFutureMessageDto } from '../dto/future-message.dto';

@ApiTags('رسائل المستقبل')
@Controller('future-messages')
@UseGuards(AuthGuard('jwt'))
export class FutureMessageController {
  constructor(private readonly futureMessageService: FutureMessageService) {}

  // Create future message
  @ApiOperation({ summary: 'إنشاء رسالة مستقبلية' })
  @ApiOkResponse({ description: 'تم الإنشاء بنجاح' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 400, description: 'بيانات غير صالحة' })
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @Post()
  async create(@Request() req, @Body() createDto: CreateFutureMessageDto) {
    const userId = req.user.userId;
    return this.futureMessageService.create(userId, createDto);
  }

  // Get all user's future messages
  @ApiOperation({ summary: 'عرض رسائلي المستقبلية' })
  @ApiOkResponse({ description: 'قائمة البيانات', schema: { type: 'array', items: { type: 'object' } } })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @Get()
  async findAll(@Request() req, @Query('includeDelivered') includeDelivered?: string) {
    const userId = req.user.userId;
    const include = includeDelivered === 'true';
    return this.futureMessageService.findAll(userId, include);
  }

  // Get single future message
  @ApiOperation({ summary: 'عرض رسالة مستقبلية' })
  @ApiOkResponse({ description: 'تفاصيل العنصر' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @ApiResponse({ status: 404, description: 'الرسالة غير موجودة' })
  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.futureMessageService.findOne(userId, id);
  }

  // Update future message
  @ApiOperation({ summary: 'تحديث رسالة مستقبلية' })
  @ApiOkResponse({ description: 'تم التحديث بنجاح' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 400, description: 'بيانات غير صالحة' })
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @ApiResponse({ status: 404, description: 'الرسالة غير موجودة' })
  @Patch(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateDto: UpdateFutureMessageDto,
  ) {
    const userId = req.user.userId;
    return this.futureMessageService.update(userId, id, updateDto);
  }

  // Delete future message
  @ApiOperation({ summary: 'حذف رسالة مستقبلية' })
  @ApiOkResponse({ description: 'تم الحذف بنجاح' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @ApiResponse({ status: 404, description: 'الرسالة غير موجودة' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Request() req, @Param('id') id: string) {
    const userId = req.user.userId;
    await this.futureMessageService.remove(userId, id);
  }

  // Internal endpoint - Get messages ready for delivery (for cron job)
  @ApiOperation({ summary: 'عرض الرسائل الجاهزة للإرسال (داخلي)' })
  @ApiOkResponse({ description: 'قائمة البيانات', schema: { type: 'array', items: { type: 'object' } } })
  @Get('internal/pending-delivery')
  async getPendingDelivery() {
    return this.futureMessageService.getMessagesForDelivery();
  }

  // Internal endpoint - Mark as delivered (for cron job)
  @ApiOperation({ summary: 'تحديد كمرسلة (داخلي)' })
  @ApiOkResponse({ description: 'تم بنجاح' })
  @Post('internal/:id/deliver')
  @HttpCode(HttpStatus.NO_CONTENT)
  async markDelivered(@Param('id') id: string) {
    await this.futureMessageService.markAsDelivered(id);
  }
}
