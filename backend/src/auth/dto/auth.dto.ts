import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, Min, Max, IsArray, IsDateString, MinLength, IsBoolean } from 'class-validator';

export enum UserRole {
  USER = 'user',
  THERAPIST = 'therapist',
}

export class LoginDto {
  @ApiProperty({ description: 'البريد الإلكتروني', required: true })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'كلمة المرور', required: true })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}

export class RegisterUserDto {
  @ApiProperty({ description: 'الاسم الأول', required: true })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ description: 'اسم العائلة', required: true })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ description: 'البريد الإلكتروني', required: true })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'كلمة المرور', required: true })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ description: 'رقم الهاتف' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: 'رمز الدولة' })
  @IsString()
  @IsOptional()
  countryCode?: string;

  @ApiPropertyOptional({ description: 'تاريخ الميلاد' })
  @IsDateString()
  @IsOptional()
  birthDate?: string;

  @ApiPropertyOptional({ description: 'الجنس' })
  @IsString()
  @IsOptional()
  gender?: string;

  @ApiPropertyOptional({ description: 'الدور', enum: UserRole })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole = UserRole.USER;
}

export class RegisterTherapistDto extends RegisterUserDto {
  // --- Therapist credentials ---
  @ApiProperty({ description: 'رقم الترخيص', required: true })
  @IsString()
  @IsNotEmpty()
  licenseNumber: string;

  @ApiProperty({ description: 'التخصص', required: true })
  @IsString()
  @IsNotEmpty()
  specialty: string;

  @ApiPropertyOptional({ description: 'سنوات الخبرة' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  yearsOfExperience?: number;

  @ApiPropertyOptional({ description: 'المؤهل العلمي' })
  @IsString()
  @IsOptional()
  education?: string;

  @ApiPropertyOptional({ description: 'الشهادات' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  certifications?: string[];

  // --- Location ---
  @ApiProperty({ description: 'المدينة', required: true })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ description: 'البلد', required: true })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiPropertyOptional({ description: 'عنوان العيادة' })
  @IsString()
  @IsOptional()
  clinicAddress?: string;

  // --- Profile ---
  @ApiPropertyOptional({ description: 'النبذة التعريفية' })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiPropertyOptional({ description: 'اللغات' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  languages?: string[];

  constructor() {
    super();
    this.role = UserRole.THERAPIST;
  }
}

export class UpdateUserDto {
  @ApiPropertyOptional({ description: 'الاسم الأول' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ description: 'اسم العائلة' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({ description: 'البريد الإلكتروني' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: 'رقم الهاتف' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: 'تاريخ الميلاد' })
  @IsDateString()
  @IsOptional()
  birthDate?: string;

  @ApiPropertyOptional({ description: 'الجنس' })
  @IsString()
  @IsOptional()
  gender?: string;

  @ApiPropertyOptional({ description: 'الصورة الشخصية' })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiPropertyOptional({ description: 'رقم الترخيص' })
  @IsString()
  @IsOptional()
  licenseNumber?: string;

  @ApiPropertyOptional({ description: 'التخصص' })
  @IsString()
  @IsOptional()
  specialty?: string;

  @ApiPropertyOptional({ description: 'سنوات الخبرة' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  yearsOfExperience?: number;

  @ApiPropertyOptional({ description: 'المؤهل العلمي' })
  @IsString()
  @IsOptional()
  education?: string;

  @ApiPropertyOptional({ description: 'الشهادات' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  certifications?: string[];

  @ApiPropertyOptional({ description: 'عنوان العيادة' })
  @IsString()
  @IsOptional()
  clinicAddress?: string;

  @ApiPropertyOptional({ description: 'الملف عام' })
  @IsBoolean()
  @IsOptional()
  isProfilePublic?: boolean;

  @ApiPropertyOptional({ description: 'نشط' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'تم التحقق' })
  @IsBoolean()
  @IsOptional()
  isVerified?: boolean;

  @ApiPropertyOptional({ description: 'إشعارات البريد' })
  @IsBoolean()
  @IsOptional()
  emailNotifications?: boolean;

  @ApiPropertyOptional({ description: 'مشاركة البيانات للأبحاث' })
  @IsBoolean()
  @IsOptional()
  shareDataForResearch?: boolean;

  @ApiPropertyOptional({ description: 'النبذة التعريفية' })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiPropertyOptional({ description: 'الدور' })
  @IsString()
  @IsOptional()
  role?: string; // 'user', 'admin', 'therapist'
}

export class ChangePasswordDto {
  @ApiProperty({ description: 'كلمة المرور الحالية', required: true })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({ description: 'كلمة المرور الجديدة', required: true })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;

  @ApiProperty({ description: 'تأكيد كلمة المرور الجديدة', required: true })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  confirmNewPassword: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ description: 'البريد الإلكتروني', required: true })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ description: 'الرمز', required: true })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ description: 'كلمة المرور الجديدة', required: true })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;

  @ApiProperty({ description: 'تأكيد كلمة المرور الجديدة', required: true })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  confirmNewPassword: string;
}

export class RefreshTokenDto {
  @ApiProperty({ description: 'رمز التحديث', required: true })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}// trigger rebuild
