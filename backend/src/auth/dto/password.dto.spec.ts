import { validate } from 'class-validator';
import { ForgotPasswordDto, ResetPasswordDto, ChangePasswordDto } from './password.dto';

describe('ForgotPasswordDto Validation', () => {
  it('should validate a valid forgot password dto', async () => {
    const forgotPasswordDto = new ForgotPasswordDto();
    forgotPasswordDto.email = 'test@example.com';

    const errors = await validate(forgotPasswordDto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation for invalid email', async () => {
    const forgotPasswordDto = new ForgotPasswordDto();
    forgotPasswordDto.email = 'invalid-email';

    const errors = await validate(forgotPasswordDto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('email');
    expect(errors[0].constraints).toHaveProperty('isEmail');
  });

  it('should fail validation for empty email', async () => {
    const forgotPasswordDto = new ForgotPasswordDto();
    forgotPasswordDto.email = '';

    const errors = await validate(forgotPasswordDto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('email');
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });
});

describe('ResetPasswordDto Validation', () => {
  it('should validate a valid reset password dto', async () => {
    const resetPasswordDto = new ResetPasswordDto();
    resetPasswordDto.token = 'valid-token-string';
    resetPasswordDto.newPassword = 'ValidPass123!';

    const errors = await validate(resetPasswordDto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation for empty token', async () => {
    const resetPasswordDto = new ResetPasswordDto();
    resetPasswordDto.token = '';
    resetPasswordDto.newPassword = 'ValidPass123!';

    const errors = await validate(resetPasswordDto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('token');
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail validation for weak password', async () => {
    const resetPasswordDto = new ResetPasswordDto();
    resetPasswordDto.token = 'valid-token-string';
    resetPasswordDto.newPassword = 'weak';

    const errors = await validate(resetPasswordDto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('newPassword');
    expect(errors[0].constraints).toHaveProperty('minLength');
  });

  it('should fail validation for password without required characters', async () => {
    const resetPasswordDto = new ResetPasswordDto();
    resetPasswordDto.token = 'valid-token-string';
    resetPasswordDto.newPassword = 'nouppercase123!';

    const errors = await validate(resetPasswordDto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('newPassword');
    expect(errors[0].constraints).toHaveProperty('matches');
  });
});

describe('ChangePasswordDto Validation', () => {
  it('should validate a valid change password dto', async () => {
    const changePasswordDto = new ChangePasswordDto();
    changePasswordDto.currentPassword = 'OldPass123!';
    changePasswordDto.newPassword = 'NewPass123!';

    const errors = await validate(changePasswordDto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation for empty current password', async () => {
    const changePasswordDto = new ChangePasswordDto();
    changePasswordDto.currentPassword = '';
    changePasswordDto.newPassword = 'NewPass123!';

    const errors = await validate(changePasswordDto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('currentPassword');
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail validation for weak new password', async () => {
    const changePasswordDto = new ChangePasswordDto();
    changePasswordDto.currentPassword = 'OldPass123!';
    changePasswordDto.newPassword = 'weak';

    const errors = await validate(changePasswordDto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('newPassword');
    expect(errors[0].constraints).toHaveProperty('minLength');
  });
});