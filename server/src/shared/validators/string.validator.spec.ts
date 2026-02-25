import { describe, it, expect } from 'vitest';
import { StringValidator } from './string.validator';

describe('StringValidator', () => {
  describe('isRequired', () => {
    it('returns null for a non-empty string', () => {
      expect(StringValidator.isRequired('hello', 'field')).toBeNull();
    });

    it('returns error for undefined', () => {
      expect(StringValidator.isRequired(undefined, 'field')).toBe('field is required');
    });

    it('returns error for null', () => {
      expect(StringValidator.isRequired(null, 'field')).toBe('field is required');
    });

    it('returns error for empty string', () => {
      expect(StringValidator.isRequired('', 'name')).toBe('name is required');
    });
  });

  describe('isString', () => {
    it('returns null for a string value', () => {
      expect(StringValidator.isString('hello', 'field')).toBeNull();
    });

    it('returns error for a number', () => {
      expect(StringValidator.isString(42, 'field')).toBe('field must be a string');
    });

    it('returns error for an array', () => {
      expect(StringValidator.isString([], 'field')).toBe('field must be a string');
    });

    it('returns error for an object', () => {
      expect(StringValidator.isString({}, 'field')).toBe('field must be a string');
    });

    it('returns null for an empty string (type check only)', () => {
      expect(StringValidator.isString('', 'field')).toBeNull();
    });
  });

  describe('isEnum', () => {
    const allowed = ['CASH', 'STRIPE'];

    it('returns null when value is in allowed list', () => {
      expect(StringValidator.isEnum('CASH', allowed, 'paymentMethod')).toBeNull();
    });

    it('returns error when value is not in allowed list', () => {
      expect(StringValidator.isEnum('BITCOIN', allowed, 'paymentMethod')).toBe(
        'paymentMethod must be one of: CASH, STRIPE'
      );
    });

    it('returns error for non-string value', () => {
      expect(StringValidator.isEnum(123, allowed, 'paymentMethod')).toBe(
        'paymentMethod must be one of: CASH, STRIPE'
      );
    });

    it('is case-sensitive', () => {
      expect(StringValidator.isEnum('cash', allowed, 'paymentMethod')).toBe(
        'paymentMethod must be one of: CASH, STRIPE'
      );
    });
  });
});
