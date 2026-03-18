import { User } from './entities/user.entity';

export interface IUserRepository {
  findByClerkUserId(clerkUserId: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(userData: {
    clerkUserId: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string | null;
  }): Promise<User>;
  update(
    clerkUserId: string,
    userData: Partial<{
      email: string;
      firstName: string;
      lastName: string;
      phone: string | null;
    }>
  ): Promise<User | null>;
  delete(clerkUserId: string): Promise<boolean>;
}
