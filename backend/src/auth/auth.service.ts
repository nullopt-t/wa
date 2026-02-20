import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../users/user.service';
import { RegisterUserDto, RegisterTherapistDto, ChangePasswordDto } from './dto/auth.dto';
import { InvalidCredentialsException, EmailNotVerifiedException, AccountDeactivatedException, TherapistPendingApprovalException } from '../exceptions/business.exceptions';
import { HashService } from '../modules/hash/hash.service';
import { EmailService } from '../modules/email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private hashService: HashService,
    private emailService: EmailService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);

    // If user is a success message (from email exists case), throw error
    if (user && typeof user === 'object' && 'success' in user) {
      throw new InvalidCredentialsException();
    }

    // Check if user exists and has a password property before comparing
    if (user && typeof user === 'object' && 'password' in user && user.password) {
      // Check if account is deactivated
      if (user.isActive === false) {
        throw new AccountDeactivatedException();
      }

      // Check if email is verified
      if (user.isVerified === false) {
        throw new EmailNotVerifiedException(user.email);
      }

      // Check if therapist is approved by admin
      if (user.role === 'therapist' && user.isApproved === false) {
        throw new TherapistPendingApprovalException();
      }

      const isPasswordValid = await this.hashService.compare(password, user.password);
      if (isPasswordValid) {
        return user;
      }
    }

    throw new InvalidCredentialsException();
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user._id, role: user.role };
    
    // Generate access token
    const accessToken = this.jwtService.sign(payload);
    
    // Generate refresh token with longer expiry
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
      },
    };
  }

  async register(userData: RegisterUserDto | RegisterTherapistDto) {
    const result = await this.userService.create(userData);

    // If email already exists, return generic response
    if (typeof result === 'object' && 'emailSent' in result) {
      return {
        success: true,
        message: 'Verification link has been sent to your email',
        emailSent: true
      };
    }

    // Generate verification token for new user
    const resultAny = result as any;
    const verificationPayload = { 
      email: resultAny.email, 
      sub: resultAny._id || resultAny.id,
      type: 'verification'
    };
    const verificationToken = this.jwtService.sign(verificationPayload, {
      expiresIn: '24h', // Token expires in 24 hours
    });

    // Send verification email (async, don't wait)
    this.emailService.sendVerificationEmail(
      result.email,
      result.firstName,
      verificationToken
    ).catch(err => {
      console.error('Failed to send verification email:', err);
    });

    // Send welcome email after verification (you can schedule this)
    // For now, we'll send it immediately after registration
    this.emailService.sendWelcomeEmail(
      result.email,
      result.firstName
    ).catch(err => {
      console.error('Failed to send welcome email:', err);
    });

    return result;
  }

  async forgotPassword(email: string) {
    // Find the user by email
    const user = await this.userService.findByEmail(email);

    // For security, return the same response regardless of whether the email exists
    if (!user || typeof user === 'object' && 'success' in user) {
      return {
        success: true,
        message: 'If your email exists in our system, you will receive a password reset link',
      };
    }

    // Generate a password reset token
    const payload = { email: user.email, type: 'reset' };
    const token = this.jwtService.sign(payload, { expiresIn: '1h' }); // Token expires in 1 hour

    // Send password reset email
    try {
      await this.emailService.sendPasswordResetEmail(
        user.email,
        user.firstName,
        token
      );
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      throw new Error('Failed to send password reset email');
    }

    return {
      success: true,
      message: 'If your email exists in our system, you will receive a password reset link',
    };
  }

  async resetPassword(token: string, newPassword: string, confirmNewPassword: string) {
    try {
      // Verify the token
      const decoded = this.jwtService.verify(token);

      if (decoded.type !== 'reset') {
        throw new UnauthorizedException('Invalid token type');
      }

      // Check if passwords match
      if (newPassword !== confirmNewPassword) {
        throw new BadRequestException('Passwords do not match');
      }

      // Find the user by email from the token
      const user = await this.userService.findByEmail(decoded.email);

      if (!user || typeof user === 'object' && 'success' in user) {
        throw new UnauthorizedException('User not found');
      }

      // Hash the new password
      const hashedPassword = await this.hashService.hash(newPassword, 10);

      // Update the user's password in the database
      await this.userService.updatePasswordByEmail(decoded.email, hashedPassword);

      return {
        success: true,
        message: 'Password reset successfully',
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    return this.userService.changePassword(userId, changePasswordDto);
  }

  async refreshToken(refreshToken: string) {
    try {
      // Verify the refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.REFRESH_TOKEN_SECRET || 'defaultRefreshSecret',
      });

      // Generate new access token
      const newAccessToken = this.jwtService.sign({
        email: payload.email,
        sub: payload.sub,
        role: payload.role,
      });

      return {
        access_token: newAccessToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async verifyEmail(token: string) {
    try {
      // Verify the token
      const decoded = this.jwtService.verify(token);

      if (decoded.type !== 'verification') {
        throw new UnauthorizedException('Invalid token type');
      }

      // Find the user by email from the token
      const user = await this.userService.findByEmail(decoded.email);

      if (!user || typeof user === 'object' && 'success' in user) {
        throw new UnauthorizedException('User not found');
      }

      // Check if already verified
      if (user.isVerified) {
        return {
          success: true,
          message: 'Email already verified',
        };
      }

      // Update user verification status
      const userId = (user as any)._id || (user as any).id;
      await this.userService.update(userId, { isVerified: true });

      return {
        success: true,
        message: 'Email verified successfully',
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired verification token');
    }
  }

  async resendVerificationEmail(email: string) {
    try {
      // Find the user by email
      const user = await this.userService.findByEmail(email);

      if (!user || typeof user === 'object' && 'success' in user) {
        // For security, return success even if email doesn't exist
        return {
          success: true,
          message: 'If your email exists in our system, you will receive a verification link',
        };
      }

      // Check if already verified
      if (user.isVerified) {
        return {
          success: true,
          message: 'Email already verified',
        };
      }

      // Generate new verification token
      const userId = (user as any)._id || (user as any).id;
      const verificationPayload = { 
        email: user.email, 
        sub: userId,
        type: 'verification'
      };
      const verificationToken = this.jwtService.sign(verificationPayload, {
        expiresIn: '24h',
      });

      // Send verification email
      await this.emailService.sendVerificationEmail(
        user.email,
        user.firstName,
        verificationToken
      );

      return {
        success: true,
        message: 'Verification email sent successfully',
      };
    } catch (error) {
      console.error('Resend verification error:', error);
      throw new Error('Failed to resend verification email');
    }
  }
}