import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { RegisterUserDto, RegisterTherapistDto, UserRole, ChangePasswordDto } from '../auth/dto/auth.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { HashService } from '../modules/hash/hash.service';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private hashService: HashService,
  ) { }

  async findByEmail(email: string): Promise<(Omit<User, 'password'> & { password: string }) | { success: boolean; message: string; emailSent: boolean } | null> {
    // Try to get from cache first
    const cachedUser = await this.cacheManager.get<Omit<User, 'password'>>(`user:email:${email}`);
    if (cachedUser) {
      // Get the full user from DB to include password for validation
      const user = await this.userModel.findOne({ email }).exec();
      if (user) {
        return user.toObject();
      }
    }

    const user = await this.userModel.findOne({ email }).exec();
    if (user) {
      // Return full user object with password for validation
      const userObj = user.toObject();
      // Cache the user for 10 minutes (without password)
      const { password, ...userWithoutPassword } = userObj;
      await this.cacheManager.set(`user:email:${email}`, userWithoutPassword, 600000); // 10 minutes in milliseconds
      return userObj; // Return full user object with password
    }
    return null;
  }

  async findById(id: string): Promise<Omit<User, 'password'> | null> {
    // Try to get from cache first
    const cachedUser = await this.cacheManager.get<Omit<User, 'password'>>(`user:id:${id}`);
    if (cachedUser) {
      return cachedUser;
    }

    const user = await this.userModel.findById(id).exec();
    if (user) {
      const { password, ...userWithoutPassword } = user.toObject();
      // Cache the user for 10 minutes (without password)
      await this.cacheManager.set(`user:id:${id}`, userWithoutPassword, 600000); // 10 minutes in milliseconds
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

        // Convert education string to array if provided
        if (therapistData.education) {
          userObject.education = [therapistData.education];
        }

        // Handle certifications array
        userObject.certifications = therapistData.certifications || [];
      }

      this.logger.log('Creating user model instance...');
      const createdUser = new this.userModel(userObject);
      this.logger.log('Saving user to database...');
      await createdUser.save();
      this.logger.log('User saved successfully');

      const userObjectWithoutPassword = createdUser.toObject();
      const { password, ...result } = userObjectWithoutPassword;

      // Cache the newly created user (with error handling)
      try {
        await this.cacheManager.set(`user:email:${userData.email}`, result, 600000); // 10 minutes
        await this.cacheManager.set(`user:id:${createdUser._id.toString()}`, result, 600000); // 10 minutes
      } catch (cacheError) {
        // If caching fails, log the error but don't fail the registration
        this.logger.error('Error caching user:', cacheError);
      }

      this.logger.log('User creation completed successfully');
      return result as Omit<User, 'password'>;
    } catch (error) {
      // Log the error for debugging purposes
      this.logger.error('Error creating user:', error);
      this.logger.error('Error stack:', error.stack);
      throw error; // Re-throw to let the global exception filter handle it
    }
  }

  async findAll(): Promise<Omit<User, 'password'>[]> {
    // For now, not caching the entire user list since it changes frequently
    const users = await this.userModel.find().exec();
    return users.map(({ password, ...userWithoutPassword }) => userWithoutPassword as Omit<User, 'password'>);
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

    // Invalidate the cached user
    await this.cacheManager.del(`user:id:${id}`);
    if (updateData.email) {
      await this.cacheManager.del(`user:email:${updateData.email}`);
    }

    const { password, ...result } = updatedUser.toObject();
    return result as Omit<User, 'password'>;
  }

  async delete(id: string): Promise<void> {
    const deletedUser = await this.userModel.findByIdAndDelete(id).exec();
    if (!deletedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Invalidate the cached user
    await this.cacheManager.del(`user:id:${id}`);
    const userObj = deletedUser.toObject();
    if (userObj.email) {
      await this.cacheManager.del(`user:email:${userObj.email}`);
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

    // Invalidate cached user
    await this.cacheManager.del(`user:id:${userId}`);
    await this.cacheManager.del(`user:email:${user.email}`);

    return { message: 'Password changed successfully' };
  }

  async updatePasswordByEmail(email: string, hashedPassword: string): Promise<void> {
    const user = await this.userModel.findOne({ email }).exec();
    
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    // Update the password
    await this.userModel.findOneAndUpdate({ email }, { password: hashedPassword });

    // Invalidate cached user
    await this.cacheManager.del(`user:id:${user._id}`);
    await this.cacheManager.del(`user:email:${email}`);
  }
}