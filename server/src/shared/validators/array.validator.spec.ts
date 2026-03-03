import { describe, it, expect } from 'vitest';
import { ArrayValidator } from './array.validator';

describe('ArrayValidator', () => {
  describe('isArray', () => {
    it('returns null for an array', () => {
      expect(ArrayValidator.isArray([], 'items')).toBeNull();
      expect(ArrayValidator.isArray([1, 2, 3], 'items')).toBeNull();
    });

    it('returns error for a string', () => {
      expect(ArrayValidator.isArray('not an array', 'items')).toBe(
        'items must be an array'
      );
    });

    it('returns error for a number', () => {
      expect(ArrayValidator.isArray(42, 'items')).toBe(
        'items must be an array'
      );
    });

    it('returns error for undefined', () => {
      expect(ArrayValidator.isArray(undefined, 'items')).toBe(
        'items must be an array'
      );
    });

    it('returns error for null', () => {
      expect(ArrayValidator.isArray(null, 'items')).toBe(
        'items must be an array'
      );
    });

    it('returns error for an object', () => {
      expect(ArrayValidator.isArray({}, 'items')).toBe(
        'items must be an array'
      );
    });
  });

  describe('isNonEmpty', () => {
    it('returns null for a non-empty array', () => {
      expect(ArrayValidator.isNonEmpty(['a'], 'serviceIds')).toBeNull();
      expect(ArrayValidator.isNonEmpty([1, 2], 'serviceIds')).toBeNull();
    });

    it('returns error for an empty array', () => {
      expect(ArrayValidator.isNonEmpty([], 'serviceIds')).toBe(
        'serviceIds must not be empty'
      );
    });

    it('returns array type error when given a non-array', () => {
      expect(ArrayValidator.isNonEmpty('not-array', 'serviceIds')).toBe(
        'serviceIds must be an array'
      );
    });

    it('returns array type error when given undefined', () => {
      expect(ArrayValidator.isNonEmpty(undefined, 'serviceIds')).toBe(
        'serviceIds must be an array'
      );
    });
  });
});
