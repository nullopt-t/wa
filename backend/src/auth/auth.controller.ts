import { Controller, Post, Body, UseGuards, Get, Request, Patch } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RegisterUserDto, RegisterTherapistDto, LoginDto, ChangePasswordDto, ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';
import { UserService } from '../users/user.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @Post('register')
  async register(@Body() registerDto: RegisterUserDto | RegisterTherapistDto) {
    const result = await this.authService.register(registerDto);

    // For security, we return a generic response for both cases
    // to prevent account enumeration
    if (typeof result === 'object' && 'emailSent' in result) {
      // Case where email already exists - return generic success
      return {
        success: true,
        message: 'Verification link has been sent to your email',
        emailSent: true
      };
    } else {
      // Case where new user was created - return user info
      return result;
    }
  }

  @Post('login')
  @UseGuards(AuthGuard('local'))
  async login(@Body() loginDto: LoginDto, @Request() req) {
    // The validation is done in the strategy, so we can proceed directly
    // The LoginDto provides additional validation layer
    return this.authService.login(req.user);
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  getProfile(@Request() req) {
    return req.user;
  }

  @Patch('change-password')
  @UseGuards(AuthGuard('jwt'))
  async changePassword(
    @Request() req,
    @Body() changePasswordDto: ChangePasswordDto
  ) {
    return this.authService.changePassword(req.user.id, changePasswordDto);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword
    );
  }

  @Patch('privacy-settings')
  @UseGuards(AuthGuard('jwt'))
  async updatePrivacySettings(
    @Request() req,
    @Body() privacySettings: { isProfilePublic?: boolean; emailNotifications?: boolean; shareDataForResearch?: boolean }
  ) {
    return this.userService.update(req.user.userId, privacySettings);
  }
}