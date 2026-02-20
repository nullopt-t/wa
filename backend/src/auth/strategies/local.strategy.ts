import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { InvalidCredentialsException, TherapistPendingApprovalException } from '../../exceptions/business.exceptions';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' }); // Use email instead of username
  }

  async validate(email: string, password: string): Promise<any> {
    try {
      const user = await this.authService.validateUser(email, password);
      if (!user) {
        throw new InvalidCredentialsException();
      }
      return user;
    } catch (error) {
      // If it's already our custom exception, just rethrow it
      if (error instanceof InvalidCredentialsException || error instanceof TherapistPendingApprovalException) {
        throw error;
      }
      // Otherwise, throw a generic invalid credentials exception
      throw new InvalidCredentialsException();
    }
  }
}