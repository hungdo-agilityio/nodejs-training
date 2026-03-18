import { Repository } from 'typeorm';
import { AppDataSource } from '@shared/database';
import { User } from './entities/user.entity';
import { IUserRepository } from './user.repository.interface';

export class UserRepository implements IUserRepository {
  private repository: Repository<User>;

  constructor() {
    this.repository = AppDataSource.getRepository(User);
  }

  async findByClerkUserId(clerkUserId: string): Promise<User | null> {
    return this.repository.findOneBy({ clerkUserId });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOneBy({ email });
  }

  async create(userData: {
    clerkUserId: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string | null;
  }): Promise<User> {
    const user = this.repository.create(userData);
    return this.repository.save(user);
  }

  async update(
    clerkUserId: string,
    userData: Partial<{
      email: string;
      firstName: string;
      lastName: string;
      phone: string | null;
    }>
  ): Promise<User | null> {
    const user = await this.findByClerkUserId(clerkUserId);
    if (!user) {
      return null;
    }
    Object.assign(user, userData);
    return this.repository.save(user);
  }

  async delete(clerkUserId: string): Promise<boolean> {
    const result = await this.repository.delete({ clerkUserId });
    return (result.affected ?? 0) > 0;
  }
}
