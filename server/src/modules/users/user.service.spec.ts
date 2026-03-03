import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserService } from './user.service';

const mockRepository = {
  findByClerkUserId: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

const mockLogger = {
  log: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

const fakeUser = {
  id: 'user-1',
  clerkUserId: 'clerk_abc',
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  phone: null,
};

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new UserService(mockRepository as never, mockLogger);
  });

  describe('getUserByClerkId', () => {
    it('returns the user when found', async () => {
      mockRepository.findByClerkUserId.mockResolvedValue(fakeUser);

      const result = await service.getUserByClerkId('clerk_abc');

      expect(result.isOk()).toBe(true);
      expect(result.getValue()).toEqual(fakeUser);
    });

    it('returns 404 error when user is not found', async () => {
      mockRepository.findByClerkUserId.mockResolvedValue(null);

      const result = await service.getUserByClerkId('clerk_unknown');

      expect(result.isErr()).toBe(true);
      expect(result.getError().statusCode).toBe(404);
      expect(result.getError().message).toBe('User not found');
    });

    it('returns internal error when repository throws', async () => {
      mockRepository.findByClerkUserId.mockRejectedValue(new Error('DB fail'));

      const result = await service.getUserByClerkId('clerk_abc');

      expect(result.isErr()).toBe(true);
      expect(result.getError().statusCode).toBe(500);
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('syncUserFromClerk', () => {
    const clerkData = {
      id: 'clerk_abc',
      first_name: 'John',
      last_name: 'Doe',
      email_addresses: [{ id: 'email-1', email_address: 'john@example.com' }],
      primary_email_address_id: 'email-1',
      phone_numbers: [],
      primary_phone_number_id: null,
    };

    it('creates a new user when none exists', async () => {
      mockRepository.findByClerkUserId.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(fakeUser);

      const result = await service.syncUserFromClerk(clerkData);

      expect(result.isOk()).toBe(true);
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'john@example.com',
          clerkUserId: 'clerk_abc',
        })
      );
    });

    it('updates existing user when found', async () => {
      mockRepository.findByClerkUserId.mockResolvedValue(fakeUser);
      const updatedUser = { ...fakeUser, firstName: 'John' };
      mockRepository.update.mockResolvedValue(updatedUser);

      const result = await service.syncUserFromClerk(clerkData);

      expect(result.isOk()).toBe(true);
      expect(mockRepository.update).toHaveBeenCalledWith(
        'clerk_abc',
        expect.objectContaining({ email: 'john@example.com' })
      );
    });

    it('returns validation error when no primary email exists', async () => {
      const badClerkData = {
        ...clerkData,
        email_addresses: [],
        primary_email_address_id: 'missing',
      };

      const result = await service.syncUserFromClerk(badClerkData);

      expect(result.isErr()).toBe(true);
      expect(result.getError().statusCode).toBe(400);
      expect(result.getError().message).toContain('primary email');
    });

    it('returns internal error when update returns null', async () => {
      mockRepository.findByClerkUserId.mockResolvedValue(fakeUser);
      mockRepository.update.mockResolvedValue(null);

      const result = await service.syncUserFromClerk(clerkData);

      expect(result.isErr()).toBe(true);
      expect(result.getError().statusCode).toBe(500);
    });
  });

  describe('deleteUserByClerkId', () => {
    it('returns true when deletion succeeds', async () => {
      mockRepository.delete.mockResolvedValue(true);

      const result = await service.deleteUserByClerkId('clerk_abc');

      expect(result.isOk()).toBe(true);
      expect(result.getValue()).toBe(true);
    });

    it('returns false when user did not exist', async () => {
      mockRepository.delete.mockResolvedValue(false);

      const result = await service.deleteUserByClerkId('clerk_unknown');

      expect(result.isOk()).toBe(true);
      expect(result.getValue()).toBe(false);
    });

    it('returns internal error when repository throws', async () => {
      mockRepository.delete.mockRejectedValue(new Error('DB error'));

      const result = await service.deleteUserByClerkId('clerk_abc');

      expect(result.isErr()).toBe(true);
      expect(result.getError().statusCode).toBe(500);
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });
});
