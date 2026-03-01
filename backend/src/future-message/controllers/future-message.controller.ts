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
import { AuthGuard } from '@nestjs/passport';
import { FutureMessageService } from '../services/future-message.service';
import { CreateFutureMessageDto, UpdateFutureMessageDto } from '../dto/future-message.dto';

@Controller('future-messages')
@UseGuards(AuthGuard('jwt'))
export class FutureMessageController {
  constructor(private readonly futureMessageService: FutureMessageService) {}

  // Create future message
  @Post()
  async create(@Request() req, @Body() createDto: CreateFutureMessageDto) {
    const userId = req.user.userId;
    return this.futureMessageService.create(userId, createDto);
  }

  // Get all user's future messages
  @Get()
  async findAll(@Request() req, @Query('includeDelivered') includeDelivered?: string) {
    const userId = req.user.userId;
    const include = includeDelivered === 'true';
    return this.futureMessageService.findAll(userId, include);
  }

  // Get single future message
  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.futureMessageService.findOne(userId, id);
  }

  // Update future message
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
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Request() req, @Param('id') id: string) {
    const userId = req.user.userId;
    await this.futureMessageService.remove(userId, id);
  }

  // Internal endpoint - Get messages ready for delivery (for cron job)
  @Get('internal/pending-delivery')
  async getPendingDelivery() {
    return this.futureMessageService.getMessagesForDelivery();
  }

  // Internal endpoint - Mark as delivered (for cron job)
  @Post('internal/:id/deliver')
  @HttpCode(HttpStatus.NO_CONTENT)
  async markDelivered(@Param('id') id: string) {
    await this.futureMessageService.markAsDelivered(id);
  }
}
