import { IsString, IsEnum, IsOptional, MinLength } from 'class-validator';

export class UpdateFeedbackStatusDto {
  @IsEnum(['pending', 'approved', 'rejected'])
  status: 'pending' | 'approved' | 'rejected';

  @IsString()
  @IsOptional()
  @MinLength(1)
  adminResponse?: string;
}
