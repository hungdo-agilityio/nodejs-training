import { ILogger } from '@shared/types';
import { Result } from '@shared/utils';
import { ApiError } from '@shared/errors';
import { IUserRepository } from './user.repository.interface';
import { ClerkUserData, IUserService } from './user.service.interface';
import { User } from './entities/user.entity';

export class UserService implements IUserService {
  constructor(
    private userRepository: IUserRepository,
    private logger: ILogger
  ) {}

  async getUserByClerkId(clerkUserId: string): Promise<Result<User, ApiError>> {
    try {
      const user = await this.userRepository.findByClerkUserId(clerkUserId);

      if (!user) {
        return Result.err(ApiError.notFound('User not found'));
      }

      return Result.ok(user);
    } catch (error) {
      this.logger.error('Failed to get user by Clerk ID', error as Error);
      return Result.err(ApiError.internalError('Failed to retrieve user'));
    }
  }

  async syncUserFromClerk(
    clerkUser: ClerkUserData
  ): Promise<Result<User, ApiError>> {
    try {
      const primaryEmail = clerkUser.email_addresses.find(
        (e) => e.id === clerkUser.primary_email_address_id
      );

      if (!primaryEmail) {
        return Result.err(
          ApiError.validationError('User has no primary email address')
        );
      }

      const primaryPhone = clerkUser.phone_numbers?.find(
        (p) => p.id === clerkUser.primary_phone_number_id
      );

      const userData = {
        clerkUserId: clerkUser.id,
        email: primaryEmail.email_address,
        firstName: clerkUser.first_name || '',
        lastName: clerkUser.last_name || '',
        phone: primaryPhone?.phone_number || null,
      };

      const existingUser = await this.userRepository.findByClerkUserId(
        clerkUser.id
      );

      if (existingUser) {
        this.logger.info(`Updating user: ${clerkUser.id}`);
        const updated = await this.userRepository.update(clerkUser.id, {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone,
        });

        if (!updated) {
          return Result.err(ApiError.internalError('Failed to update user'));
        }

        return Result.ok(updated);
      }

      this.logger.info(`Creating user: ${clerkUser.id}`);
      const user = await this.userRepository.create(userData);
      return Result.ok(user);
    } catch (error) {
      this.logger.error('Failed to sync user from Clerk', error as Error);
      return Result.err(ApiError.internalError('Failed to sync user'));
    }
  }

  async deleteUserByClerkId(
    clerkUserId: string
  ): Promise<Result<boolean, ApiError>> {
    try {
      this.logger.info(`Deleting user: ${clerkUserId}`);
      const deleted = await this.userRepository.delete(clerkUserId);

      return Result.ok(deleted);
    } catch (error) {
      this.logger.error('Failed to delete user', error as Error);
      return Result.err(ApiError.internalError('Failed to delete user'));
    }
  }
}
