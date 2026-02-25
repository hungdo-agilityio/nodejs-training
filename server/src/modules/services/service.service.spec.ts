import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ServiceService } from './service.service';

const mockRepository = {
  findAllActive: vi.fn(),
};

const mockLogger = {
  log: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

describe('ServiceService', () => {
  let service: ServiceService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ServiceService(mockRepository as never, mockLogger);
  });

  describe('getActiveServices', () => {
    it('returns active services on success', async () => {
      const fakeServices = [
        { id: '1', name: 'Haircut', price: 25, durationMinutes: 30, isActive: true },
        { id: '2', name: 'Coloring', price: 80, durationMinutes: 90, isActive: true },
      ];
      mockRepository.findAllActive.mockResolvedValue(fakeServices);

      const result = await service.getActiveServices();

      expect(result.isOk()).toBe(true);
      expect(result.getValue()).toEqual(fakeServices);
    });

    it('returns an internal error when repository throws', async () => {
      mockRepository.findAllActive.mockRejectedValue(new Error('DB down'));

      const result = await service.getActiveServices();

      expect(result.isErr()).toBe(true);
      expect(result.getError().statusCode).toBe(500);
      expect(result.getError().message).toBe('Failed to retrieve services');
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('returns an empty array when no services exist', async () => {
      mockRepository.findAllActive.mockResolvedValue([]);

      const result = await service.getActiveServices();

      expect(result.isOk()).toBe(true);
      expect(result.getValue()).toEqual([]);
    });
  });
});
