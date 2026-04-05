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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { JourneyService } from '../services/journey.service';
import {
  CreateJourneyDto,
  UpdateJourneyDto,
  CompleteResourceDto,
} from '../dto/journey.dto';

@ApiTags('الرحلة')
@Controller('journey')
export class JourneyController {
  constructor(private readonly journeyService: JourneyService) {}

  // ==================== PUBLIC ENDPOINTS (Single Journey) ====================

  @ApiOperation({ summary: 'Get the active journey structure' })
  @ApiOkResponse({ description: 'Journey details with levels and resources' })
  @ApiResponse({ status: 404, description: 'No active journey found' })
  @Get()
  async getActiveJourney() {
    return this.journeyService.findActive();
  }

  @ApiOperation({ summary: "Get current user's progress" })
  @ApiOkResponse({ description: 'User progress data' })
  @ApiBearerAuth('access-token')
  @Get('progress')
  @UseGuards(AuthGuard('jwt'))
  async getUserProgress(@Request() req) {
    const journey = await this.journeyService.findActive();
    return this.journeyService.getProgress(req.user.userId, (journey._id as any).toString());
  }

  @ApiOperation({ summary: 'Start the journey' })
  @ApiOkResponse({ description: 'Progress initialized' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 409, description: 'Journey already started' })
  @Post('start')
  @UseGuards(AuthGuard('jwt'))
  async startJourney(@Request() req) {
    const journey = await this.journeyService.findActive();
    return this.journeyService.startJourney(req.user.userId, (journey._id as any).toString());
  }

  @ApiOperation({ summary: 'Mark a resource as completed' })
  @ApiOkResponse({ description: 'Updated progress' })
  @ApiBearerAuth('access-token')
  @Post('levels/:levelNumber/complete-resource')
  @UseGuards(AuthGuard('jwt'))
  async completeResource(
    @Request() req,
    @Param('levelNumber') levelNumber: string,
    @Body() completeResourceDto: CompleteResourceDto,
  ) {
    const journey = await this.journeyService.findActive();
    return this.journeyService.completeResource(
      req.user.userId,
      (journey._id as any).toString(),
      parseInt(levelNumber),
      completeResourceDto,
    );
  }

  @ApiOperation({ summary: 'Mark a level as completed' })
  @ApiOkResponse({ description: 'Updated progress' })
  @ApiBearerAuth('access-token')
  @Post('levels/:levelNumber/complete')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  async completeLevel(
    @Request() req,
    @Param('levelNumber') levelNumber: string,
  ) {
    const journey = await this.journeyService.findActive();
    return this.journeyService.completeLevel(
      req.user.userId,
      (journey._id as any).toString(),
      parseInt(levelNumber),
    );
  }

  // ==================== ADMIN ENDPOINTS ====================

  @ApiOperation({ summary: 'Create or replace the journey (admin only)' })
  @ApiOkResponse({ description: 'Journey created. Any existing journey is deactivated.' })
  @ApiBearerAuth('access-token')
  @Post()
  @UseGuards(AuthGuard('jwt'))
  async createJourney(@Body() createDto: CreateJourneyDto) {
    return this.journeyService.create(createDto);
  }

  @ApiOperation({ summary: 'Update the journey (admin only)' })
  @ApiOkResponse({ description: 'Journey updated' })
  @ApiBearerAuth('access-token')
  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  async updateJourney(
    @Param('id') id: string,
    @Body() updateDto: UpdateJourneyDto,
  ) {
    return this.journeyService.update(id, updateDto);
  }

  @ApiOperation({ summary: 'Delete the journey (admin only)' })
  @ApiOkResponse({ description: 'Journey deleted' })
  @ApiBearerAuth('access-token')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard('jwt'))
  async deleteJourney(@Param('id') id: string) {
    await this.journeyService.remove(id);
  }

  @ApiOperation({ summary: 'Get all journeys (admin only)' })
  @ApiOkResponse({ description: 'List of journeys' })
  @ApiBearerAuth('access-token')
  @Get('admin')
  @UseGuards(AuthGuard('jwt'))
  async getAllJourneys() {
    return this.journeyService.findAll();
  }
}
