import { Test, TestingModule } from '@nestjs/testing';
import { validate } from 'class-validator';
import { LoginDto } from './auth.dto';

describe('LoginDto Validation', () => {
  it('should validate a valid login dto', async () => {
    const loginDto = new LoginDto();
    loginDto.email = 'test@example.com';
    loginDto.password = 'password123';

    const errors = await validate(loginDto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation for invalid email', async () => {
    const loginDto = new LoginDto();
    loginDto.email = 'invalid-email';
    loginDto.password = 'password123';

    const errors = await validate(loginDto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('email');
    expect(errors[0].constraints).toHaveProperty('isEmail');
  });

  it('should fail validation for empty email', async () => {
    const loginDto = new LoginDto();
    loginDto.email = '';
    loginDto.password = 'password123';

    const errors = await validate(loginDto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('email');
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail validation for empty password', async () => {
    const loginDto = new LoginDto();
    loginDto.email = 'test@example.com';
    loginDto.password = '';

    const errors = await validate(loginDto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('password');
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail validation for short password', async () => {
    const loginDto = new LoginDto();
    loginDto.email = 'test@example.com';
    loginDto.password = '123'; // Less than minimum length of 6

    const errors = await validate(loginDto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('password');
    expect(errors[0].constraints).toHaveProperty('minLength');
  });
});