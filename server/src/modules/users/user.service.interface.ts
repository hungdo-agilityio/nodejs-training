import { User } from './entities/user.entity';
import { Result } from '@shared/utils';

export interface ClerkUserData {
  id: string;
  email_addresses: Array<{
    id: string;
    email_address: string;
  }>;
  primary_email_address_id: string;
  first_name: string | null;
  last_name: string | null;
  phone_numbers?: Array<{
    id: string;
    phone_number: string;
  }>;
  primary_phone_number_id?: string | null;
}

export interface IUserService {
  getUserByClerkId(clerkUserId: string): Promise<Result<User, string>>;
  syncUserFromClerk(clerkUser: ClerkUserData): Promise<Result<User, string>>;
  deleteUserByClerkId(clerkUserId: string): Promise<Result<boolean, string>>;
}
