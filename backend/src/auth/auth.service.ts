import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../users/user.service';
import {
  RegisterUserDto,
  RegisterTherapistDto,
  ChangePasswordDto,
} from './dto/auth.dto';
import {
  InvalidCredentialsException,
  EmailNotVerifiedException,
  AccountDeactivatedException,
} from '../exceptions/business.exceptions';
import { HashService } from '../modules/hash/hash.service';
import { NotificationService } from '../notification/services/notification.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private hashService: HashService,
    private notificationService: NotificationService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);

    if (user && typeof user === 'object' && 'success' in user) {
      this.logger.warn(`Invalid login attempt (fake success object) for ${email}`);
      throw new InvalidCredentialsException();
    }

    if (user && typeof user === 'object' && 'password' in user && user.password) {
      if (user.isActive === false) {
        this.logger.warn(`Login attempt for deactivated account: ${email}`);
        throw new AccountDeactivatedException();
      }

      // Email verification is not required — users can log in immediately
      // if (user.isVerified === false) {
      //   this.logger.warn(`Login attempt for unverified email: ${email}`);
      //   throw new EmailNotVerifiedException(user.email);
      // }

      const isPasswordValid = await this.hashService.compare(password, user.password);

      if (!isPasswordValid) {
        this.logger.warn(`Invalid password attempt for ${email}`);
        throw new InvalidCredentialsException();
      }

      this.logger.log(`User validated successfully: ${email}`);
      return user;
    }

    this.logger.warn(`User not found or invalid login: ${email}`);
    throw new InvalidCredentialsException();
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user._id, role: user.role };

    const accessToken = this.jwtService.sign(payload);

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.REFRESH_TOKEN_SECRET || 'defaultRefreshSecret',
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d',
    });

    this.logger.log(`User logged in: ${user.email}`);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        countryCode: user.countryCode,
      },
    };
  }

  async register(userData: RegisterUserDto | RegisterTherapistDto) {
    const result = await this.userService.create(userData);

    // If user already exists, auto-verify, update password, and return login tokens
    if (typeof result === 'object' && 'emailSent' in result) {
      const existingUser = await this.userService.findByEmail(userData.email);
      if (existingUser) {
        const userId = (existingUser as any)._id || (existingUser as any).id;
        // Auto-verify if not already verified
        if (!existingUser.isVerified) {
          await this.userService.update(userId, { isVerified: true });
        }
        // Update password to the new one they just entered
        const hashedPassword = await this.hashService.hash(userData.password, 10);
        await this.userService.update(userId, { password: hashedPassword });
        // Return login tokens with fresh password
        const updatedUser = await this.userService.findByEmail(userData.email);
        return this.authServiceLogin(updatedUser);
      }
      return {
        success: true,
        message: 'Verification link has been sent to your email',
        emailSent: true,
      };
    }

    const resultAny = result as any;

    // Auto-verify users — no email verification required
    await this.userService.update(resultAny._id || resultAny.id, { isVerified: true });

    this.logger.log(`User registered and auto-verified: ${result.email}`);

    return result;
  }

  // Helper to generate login tokens (same as login method)
  private authServiceLogin(user: any) {
    const payload = { email: user.email, sub: user._id, role: user.role };

    const accessToken = this.jwtService.sign(payload);

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.REFRESH_TOKEN_SECRET || 'defaultRefreshSecret',
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d',
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        countryCode: user.countryCode,
      },
    };
  }

  async forgotPassword(email: string) {
    const user = await this.userService.findByEmail(email);

    if (!user || (typeof user === 'object' && 'success' in user)) {
      this.logger.warn(`Forgot password requested for non-existing email: ${email}`);
      return {
        success: true,
        message:
          'If your email exists in our system, you will receive a password reset link',
      };
    }

    // Email sending disabled — password reset not available
    this.logger.warn(`Password reset requested for ${email} — email sending disabled`);
    return {
      success: true,
      message:
        'Password reset via email is currently disabled. Please contact support.',
    };
  }

  async resetPassword(
    token: string,
    newPassword: string,
    confirmNewPassword: string,
  ) {
    try {
      const decoded = this.jwtService.verify(token);

      if (decoded.type !== 'reset') {
        throw new UnauthorizedException('Invalid token type');
      }

      if (newPassword !== confirmNewPassword) {
        throw new BadRequestException('Passwords do not match');
      }

      const user = await this.userService.findByEmail(decoded.email);

      if (!user || (typeof user === 'object' && 'success' in user)) {
        throw new UnauthorizedException('User not found');
      }

      const hashedPassword = await this.hashService.hash(newPassword, 10);

      await this.userService.updatePasswordByEmail(
        decoded.email,
        hashedPassword,
      );

      this.logger.log(`Password reset successfully: ${decoded.email}`);

      return {
        success: true,
        message: 'Password reset successfully',
      };
    } catch (error) {
      this.logger.error('Reset password failed', error.stack);

      if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
        throw error;
      }

      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    this.logger.log(`Password change requested for userId: ${userId}`);
    return this.userService.changePassword(userId, changePasswordDto);
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.REFRESH_TOKEN_SECRET || 'defaultRefreshSecret',
      });

      const newAccessToken = this.jwtService.sign({
        email: payload.email,
        sub: payload.sub,
        role: payload.role,
      });

      this.logger.log(`Token refreshed for user: ${payload.email}`);

      return {
        access_token: newAccessToken,
      };
    } catch (error) {
      this.logger.warn('Invalid refresh token attempt');
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async verifyEmail(token: string) {
    try {
      const decoded = this.jwtService.verify(token);

      if (decoded.type !== 'verification') {
        throw new UnauthorizedException('Invalid token type');
      }

      const user = await this.userService.findByEmail(decoded.email);

      if (!user || (typeof user === 'object' && 'success' in user)) {
        throw new UnauthorizedException('User not found');
      }

      if (user.isVerified) {
        this.logger.log(`Email already verified: ${decoded.email}`);
        return {
          success: true,
          message: 'Email already verified',
        };
      }

      const userId = (user as any)._id || (user as any).id;
      await this.userService.update(userId, { isVerified: true });

      // Send account activated notification
      try {
        await this.notificationService.createAccountActivatedNotification(userId.toString());
      } catch (err) {
        // Don't fail verification if notification fails
        this.logger.error('Failed to send account activated notification', err);
      }

      this.logger.log(`Email verified successfully: ${decoded.email}`);

      return {
        success: true,
        message: 'Email verified successfully',
      };
    } catch (error) {
      this.logger.error('Email verification failed', error.stack);

      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException(
        'Invalid or expired verification token',
      );
    }
  }

  async resendVerificationEmail(email: string) {
    try {
      const user = await this.userService.findByEmail(email);

      if (!user || (typeof user === 'object' && 'success' in user)) {
        return {
          success: true,
          message:
            'If your email exists in our system, you will receive a verification link',
        };
      }

      // Auto-verify if not verified
      if (!user.isVerified) {
        const userId = (user as any)._id || (user as any).id;
        await this.userService.update(userId, { isVerified: true });
        this.logger.log(`Auto-verified user on resend: ${email}`);
      }

      return {
        success: true,
        message: 'Account is verified',
      };
    } catch (error) {
      this.logger.error(
        `Resend verification failed for ${email}`,
        error.message,
      );
      return {
        success: true,
        message: 'Account is verified',
      };
    }
  }
}