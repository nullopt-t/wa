import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
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
  TherapistPendingApprovalException,
} from '../exceptions/business.exceptions';
import { HashService } from '../modules/hash/hash.service';
import { EmailService } from '../modules/email/email.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private hashService: HashService,
    private emailService: EmailService,
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

      if (user.isVerified === false) {
        this.logger.warn(`Login attempt for unverified email: ${email}`);
        throw new EmailNotVerifiedException(user.email);
      }

      const isPasswordValid = await this.hashService.compare(password, user.password);

      if (!isPasswordValid) {
        this.logger.warn(`Invalid password attempt for ${email}`);
        throw new InvalidCredentialsException();
      }

      if (user.role === 'therapist') {
        const freshUser = await this.userService.findById((user as any)._id.toString());

        if (freshUser && (freshUser.isApproved === false || freshUser.isApproved === undefined)) {
          this.logger.warn(`Therapist not approved: ${email}`);
          throw new TherapistPendingApprovalException();
        }
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

    if (typeof result === 'object' && 'emailSent' in result) {
      this.logger.warn(`Register attempt with existing email: ${userData.email}`);
      return {
        success: true,
        message: 'Verification link has been sent to your email',
        emailSent: true,
      };
    }

    const resultAny = result as any;

    const verificationToken = this.jwtService.sign(
      {
        email: resultAny.email,
        sub: resultAny._id || resultAny.id,
        type: 'verification',
      },
      { expiresIn: '24h' },
    );

    this.emailService
      .sendVerificationEmail(result.email, result.firstName, verificationToken)
      .catch((err) => {
        this.logger.error(
          `Failed to send verification email to ${result.email}`,
          err.stack,
        );
      });

    this.emailService
      .sendWelcomeEmail(result.email, result.firstName)
      .catch((err) => {
        this.logger.error(
          `Failed to send welcome email to ${result.email}`,
          err.stack,
        );
      });

    this.logger.log(`User registered successfully: ${result.email}`);

    return result;
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

    const token = this.jwtService.sign(
      { email: user.email, type: 'reset' },
      { expiresIn: '1h' },
    );

    try {
      await this.emailService.sendPasswordResetEmail(
        user.email,
        user.firstName,
        token,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email to ${email}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to send password reset email',
      );
    }

    this.logger.log(`Password reset email sent: ${email}`);

    return {
      success: true,
      message:
        'If your email exists in our system, you will receive a password reset link',
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
        this.logger.warn(`Resend verification requested for non-existing email: ${email}`);
        return {
          success: true,
          message:
            'If your email exists in our system, you will receive a verification link',
        };
      }

      if (user.isVerified) {
        this.logger.log(`Resend skipped, already verified: ${email}`);
        return {
          success: true,
          message: 'Email already verified',
        };
      }

      const userId = (user as any)._id || (user as any).id;

      const verificationToken = this.jwtService.sign(
        {
          email: user.email,
          sub: userId,
          type: 'verification',
        },
        { expiresIn: '24h' },
      );

      await this.emailService.sendVerificationEmail(
        user.email,
        user.firstName,
        verificationToken,
      );

      this.logger.log(`Verification email resent: ${email}`);

      return {
        success: true,
        message: 'Verification email sent successfully',
      };
    } catch (error) {
      this.logger.error(
        `Resend verification failed for ${email}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to resend verification email',
      );
    }
  }
}