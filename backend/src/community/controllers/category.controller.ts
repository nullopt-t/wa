import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CategoryService } from '../services/category.service';
import { CreateCategoryDto, UpdateCategoryDto } from '../dto/category.dto';

@Controller('community/categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  // Get all categories (public)
  @Get()
  async findAll() {
    return this.categoryService.findAll();
  }

  // Get single category (public)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.categoryService.findOne(id);
  }

  // Create category (admin/moderator only)
  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(@Request() req, @Body() createCategoryDto: CreateCategoryDto) {
    // TODO: Add role check for admin/moderator
    return this.categoryService.create(createCategoryDto);
  }

  // Update category (admin/moderator only)
  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    // TODO: Add role check for admin/moderator
    return this.categoryService.update(id, updateCategoryDto);
  }

  // Delete category (admin only)
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async remove(@Request() req, @Param('id') id: string) {
    // TODO: Add role check for admin
    return this.categoryService.remove(id);
  }
}
