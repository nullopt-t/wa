import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiOkResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { BookService } from '../services/book.service';
import { CreateBookDto, UpdateBookDto } from '../dto/book.dto';

@ApiTags('الكتب')
@Controller('books')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @ApiOperation({ summary: 'عرض جميع الكتب' })
  @ApiOkResponse({ description: 'قائمة الكتب' })
  @Get()
  async findAll(@Query() query: any) {
    return this.bookService.findAll(query);
  }

  @ApiOperation({ summary: 'عرض الكتب المميزة' })
  @ApiOkResponse({ description: 'الكتب المميزة', type: [Object] })
  @Get('featured')
  async findFeatured(@Query('limit') limit = '6') {
    return this.bookService.findFeatured(parseInt(limit));
  }

  @ApiOperation({ summary: 'عرض كتاب بالرابط' })
  @ApiOkResponse({ description: 'تفاصيل الكتاب' })
  @ApiResponse({ status: 404, description: 'الكتاب غير موجود' })
  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.bookService.findBySlug(slug);
  }

  @ApiOperation({ summary: 'عرض كتاب' })
  @ApiOkResponse({ description: 'تفاصيل الكتاب' })
  @ApiResponse({ status: 404, description: 'الكتاب غير موجود' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.bookService.findOne(id);
  }

  @ApiOperation({ summary: 'عرض جميع الكتب (إدارة)' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @Get('admin/all')
  @UseGuards(AuthGuard('jwt'))
  async findAllForAdmin(@Query() query: any) {
    return this.bookService.findAllForAdmin(query);
  }

  @ApiOperation({ summary: 'إنشاء كتاب' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @ApiResponse({ status: 403, description: 'ممنوع' })
  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(@Body() createDto: CreateBookDto) {
    return this.bookService.create(createDto);
  }

  @ApiOperation({ summary: 'تحديث كتاب' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @ApiResponse({ status: 403, description: 'ممنوع' })
  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(@Param('id') id: string, @Body() updateDto: UpdateBookDto) {
    return this.bookService.update(id, updateDto);
  }

  @ApiOperation({ summary: 'حذف كتاب' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  @ApiResponse({ status: 403, description: 'ممنوع' })
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.bookService.remove(id);
  }
}
