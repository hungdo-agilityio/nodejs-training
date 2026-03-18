import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Service } from '../../../src/modules/salon-services/entities/service.entity';
import { User } from '../../../src/modules/users/entities/user.entity';
import { UserRole } from '../../../src/shared/types';

/** Fixed UUIDs used across all E2E tests for predictable queries */
export const TEST_IDS = {
  HAIRCUT_SERVICE: 'aaaaaaaa-0001-4000-8000-000000000001',
  COLORING_SERVICE: 'aaaaaaaa-0002-4000-8000-000000000002',
};

export const TEST_USER_CLERK_ID =
  process.env.CLERK_TEST_USER_ID ?? 'user_test_placeholder';

/**
 * Returns a future Monday date string (YYYY-MM-DD) ~1 year from now.
 * Mondays are guaranteed business days (09:00–18:00).
 */
export const getFutureMonday = (): string => {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  const daysUntilMonday = (8 - date.getDay()) % 7 || 7;
  date.setDate(date.getDate() + daysUntilMonday);
  return date.toISOString().split('T')[0];
};

export const seedTestData = async (dataSource: DataSource): Promise<void> => {
  const serviceRepo = dataSource.getRepository(Service);
  const userRepo = dataSource.getRepository(User);

  // Insert services with known IDs
  await serviceRepo
    .createQueryBuilder()
    .insert()
    .values([
      {
        id: TEST_IDS.HAIRCUT_SERVICE,
        name: 'Haircut',
        description: 'Classic haircut',
        price: 25.0,
        durationMinutes: 30,
        isActive: true,
      },
      {
        id: TEST_IDS.COLORING_SERVICE,
        name: 'Coloring',
        description: 'Hair coloring service',
        price: 80.0,
        durationMinutes: 90,
        isActive: true,
      },
    ])
    .execute();

  // Insert test user matching the Clerk session token
  await userRepo
    .createQueryBuilder()
    .insert()
    .values({
      clerkUserId: TEST_USER_CLERK_ID,
      email: 'e2e-test@example.com',
      firstName: 'E2E',
      lastName: 'Test',
      phone: null,
      role: UserRole.USER,
    })
    .execute();
};
