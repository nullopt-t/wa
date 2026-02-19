import { Controller, Get, Put, Patch, Body, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';
import { UpdateUserDto, ChangePasswordDto } from '../auth/dto/auth.dto';

@Controller('profile')
export class ProfileController {
  constructor(private userService: UserService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@Request() req) {
    return req.user;
  }

  @Put()
  @UseGuards(AuthGuard('jwt'))
  async updateProfile(
    @Request() req,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<Omit<any, 'password'>> {
    // Create a copy of the DTO with proper typing for the service
    const updateData: Partial<any> = {};
    
    // Copy each field individually to handle type conversions
    Object.keys(updateUserDto).forEach(key => {
      if (key === 'birthDate' && updateUserDto[key] && typeof updateUserDto[key] === 'string') {
        const dateValue = new Date(updateUserDto[key]);
        if (!isNaN(dateValue.getTime())) {
          updateData[key] = dateValue;
        } else {
          throw new BadRequestException('Invalid date format for birthDate');
        }
      } else if (updateUserDto[key] !== undefined) {
        updateData[key] = updateUserDto[key];
      }
    });
    
    return this.userService.update(req.user._id, updateData);
  }

  @Patch('change-password')
  @UseGuards(AuthGuard('jwt'))
  async changePassword(
    @Request() req,
    @Body() changePasswordDto: ChangePasswordDto
  ) {
    return this.userService.changePassword(req.user._id, changePasswordDto);
  }
}