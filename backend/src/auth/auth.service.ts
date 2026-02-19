import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../users/user.service';
import { RegisterUserDto, RegisterTherapistDto, ChangePasswordDto } from './dto/auth.dto';
import { InvalidCredentialsException } from '../exceptions/business.exceptions';
import { HashService } from '../modules/hash/hash.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private hashService: HashService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);

    // If user is a success message (from email exists case), throw error
    if (user && typeof user === 'object' && 'success' in user) {
      throw new InvalidCredentialsException();
    }

    // Check if user exists and has a password property before comparing
    if (user && typeof user === 'object' && 'password' in user && user.password) {
      const isPasswordValid = await this.hashService.compare(password, user.password);
      if (isPasswordValid) {
        return user;
      }
    }

    throw new InvalidCredentialsException();
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user._id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
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
    return this.userService.create(userData);
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

    // In a real application, you would send an email with the reset link
    // For now, we'll just return the token for demonstration purposes
    console.log(`Password reset token for ${email}: ${token}`); // In production, send via email

    return {
      success: true,
      message: 'If your email exists in our system, you will receive a password reset link',
    };
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      // Verify the token
      const decoded = this.jwtService.verify(token);

      if (decoded.type !== 'reset') {
        throw new UnauthorizedException('Invalid token type');
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
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    return this.userService.changePassword(userId, changePasswordDto);
  }
}