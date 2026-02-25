import { describe, it, expect } from 'vitest';
import { SlotValidator } from './slot.validator';

describe('SlotValidator', () => {
  describe('validateGetSlots', () => {
    it('returns valid for a proper date string', () => {
      const result = SlotValidator.validateGetSlots({ date: '2026-03-01' });
      expect(result.valid).toBe(true);
    });

    it('returns error when date is missing', () => {
      const result = SlotValidator.validateGetSlots({});
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error.message).toContain('date');
        expect(result.error.statusCode).toBe(400);
      }
    });

    it('returns error when date is undefined', () => {
      const result = SlotValidator.validateGetSlots({ date: undefined });
      expect(result.valid).toBe(false);
    });

    it('returns error when date is a number', () => {
      const result = SlotValidator.validateGetSlots({ date: 20260301 });
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error.message).toContain('date');
      }
    });

    it('returns error when date is an empty string', () => {
      const result = SlotValidator.validateGetSlots({ date: '' });
      expect(result.valid).toBe(false);
    });
  });
});
