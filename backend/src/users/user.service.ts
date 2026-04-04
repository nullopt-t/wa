import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from './schemas/user.schema';
import { TherapistProfile } from '../therapist/schemas/therapist-profile.schema';
import { RegisterUserDto, RegisterTherapistDto, UserRole, ChangePasswordDto } from '../auth/dto/auth.dto';
import { HashService } from '../modules/hash/hash.service';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(TherapistProfile.name) private therapistProfileModel: Model<TherapistProfile>,
    private hashService: HashService,
  ) { }

  async findByEmail(email: string): Promise<(Omit<User, 'password'> & { password: string }) | null> {
    const user = await this.userModel.findOne({ email }).exec();
    if (user) {
      return user.toObject();
    }
    return null;
  }

  async findById(id: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.userModel.findById(id).exec();
    if (user) {
      const { password, ...userWithoutPassword } = user.toObject();
      return userWithoutPassword;
    }
    return null;
  }

  async create(userData: RegisterUserDto | RegisterTherapistDto): Promise<Omit<User, 'password'> | { success: boolean; message: string; emailSent: boolean }> {
    try {
      this.logger.log('Starting user creation process...');
      
      // Check if user already exists
      const existingUser = await this.userModel.findOne({ email: userData.email }).exec();
      if (existingUser) {
        this.logger.log('User already exists, returning early');
        // For security, don't reveal that the email exists
        // Instead, pretend the registration succeeded and send an email
        // In a real implementation, you would send an email saying:
        // "If your email exists in our system, you will receive a verification message"
        // For now, we'll return a success response without revealing the account exists
        return {
          success: true,
          message: 'Verification link has been sent to your email',
          emailSent: true
        };
      }

      const hashedPassword = await this.hashService.hash(userData.password, 10);

      // Prepare user data based on role
      const userObject: any = {
        ...userData,
        password: hashedPassword,
      };

      // Convert birthDate string to Date object if provided
      if (userData.birthDate) {
        userObject.birthDate = new Date(userData.birthDate);
      }

      // Handle therapist-specific fields
      if (userData.role === UserRole.THERAPIST) {
        const therapistData = userData as RegisterTherapistDto;

        // Set therapist-specific fields on the User document too
        userObject.specialty = therapistData.specialty;
        userObject.licenseNumber = therapistData.licenseNumber;
        userObject.yearsOfExperience = therapistData.yearsOfExperience;

        // Convert education string to array if provided
        if (therapistData.education) {
          userObject.education = [therapistData.education];
        }

        // Handle certifications array
        userObject.certifications = therapistData.certifications || [];

        // Therapists are auto-approved (email verification is enough to log in)
        userObject.isApproved = true;
      } else {
        // Regular users are auto-approved
        userObject.isApproved = true;
      }

      this.logger.log('Creating user model instance...');
      const createdUser = new this.userModel(userObject);
      this.logger.log('Saving user to database...');
      await createdUser.save();
      this.logger.log('User saved successfully');

      // Create TherapistProfile if registering as therapist
      if (userData.role === UserRole.THERAPIST) {
        const therapistData = userData as RegisterTherapistDto;
        await this.therapistProfileModel.create({
          userId: createdUser._id,
          licenseNumber: therapistData.licenseNumber,
          specialty: therapistData.specialty,
          bio: therapistData.bio,
          city: therapistData.city,
          country: therapistData.country,
          clinicAddress: therapistData.clinicAddress,
          experience: therapistData.yearsOfExperience || 0,
          languages: therapistData.languages || ['ar'],
          isVerified: false,
          isTrusted: false,
          isActive: true,
          verificationSubmittedAt: new Date(),
        });
        this.logger.log(`TherapistProfile created for user: ${createdUser.email}`);
      }

      const userObjectWithoutPassword = createdUser.toObject();
      const { password, ...result } = userObjectWithoutPassword;

      this.logger.log('User creation completed successfully');
      return result as Omit<User, 'password'>;
    } catch (error) {
      // Log the error for debugging purposes
      this.logger.error('Error creating user:', error);
      this.logger.error('Error stack:', error.stack);
      throw error; // Re-throw to let the global exception filter handle it
    }
  }

  async findAll(): Promise<{ users: Omit<User, 'password'>[]; total: number }> {
    // For now, not caching the entire user list since it changes frequently
    const users = await this.userModel.find().lean().exec();
    const usersWithoutPassword = users.map(({ password, ...userWithoutPassword }) => userWithoutPassword as Omit<User, 'password'>);
    return {
      users: usersWithoutPassword,
      total: users.length,
    };
  }

  async update(id: string, updateData: Partial<User>): Promise<Omit<User, 'password'>> {
    // Prepare update object, handling special fields like birthDate
    const updateObject: any = { ...updateData };
    
    // Convert birthDate string to Date object if provided
    if (updateData.birthDate && typeof updateData.birthDate === 'string') {
      updateObject.birthDate = new Date(updateData.birthDate);
    }

    const updatedUser = await this.userModel.findByIdAndUpdate(
      id,
      { $set: updateObject },
      { new: true },
    ).exec();

    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const { password, ...result } = updatedUser.toObject();
    return result as Omit<User, 'password'>;
  }

  async delete(id: string, requestingUserId?: string): Promise<void> {
    // Prevent users from deleting their own account
    if (requestingUserId && id === requestingUserId) {
      throw new BadRequestException('لا يمكنك حذف حسابك الشخصي. استخدم خيار إلغاء الحساب بدلاً من ذلك.');
    }

    const deletedUser = await this.userModel.findByIdAndDelete(id).exec();
    if (!deletedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<{ message: string }> {
    const user = await this.userModel.findById(userId).select('+password').exec();
    
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Verify the current password
    const isCurrentPasswordValid = await this.hashService.compare(
      changePasswordDto.currentPassword,
      user.password
    );

    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Check if new password is the same as current password
    if (changePasswordDto.currentPassword === changePasswordDto.newPassword) {
      throw new BadRequestException('New password must be different from current password');
    }

    // Validate that new passwords match
    if (changePasswordDto.newPassword !== changePasswordDto.confirmNewPassword) {
      throw new BadRequestException('New passwords do not match');
    }

    // Hash the new password
    const hashedNewPassword = await this.hashService.hash(changePasswordDto.newPassword, 10);

    // Update the password
    await this.userModel.findByIdAndUpdate(userId, { password: hashedNewPassword });

    return { message: 'Password changed successfully' };
  }

  async updatePasswordByEmail(email: string, hashedPassword: string): Promise<void> {
    const user = await this.userModel.findOne({ email }).exec();
    
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    // Update the password
    await this.userModel.findOneAndUpdate({ email }, { password: hashedPassword });
  }
}