import { describe, it, expect } from 'vitest';
import { Result } from './result';

describe('Result', () => {
  describe('ok', () => {
    it('creates a success result with a value', () => {
      const result = Result.ok(42);
      expect(result.isOk()).toBe(true);
      expect(result.isErr()).toBe(false);
      expect(result.getValue()).toBe(42);
    });

    it('works with object values', () => {
      const value = { id: '1', name: 'test' };
      const result = Result.ok(value);
      expect(result.getValue()).toEqual(value);
    });

    it('works with null/undefined values', () => {
      const result = Result.ok(undefined);
      expect(result.isOk()).toBe(true);
      expect(result.getValue()).toBeUndefined();
    });
  });

  describe('err', () => {
    it('creates an error result', () => {
      const error = new Error('something went wrong');
      const result = Result.err(error);
      expect(result.isOk()).toBe(false);
      expect(result.isErr()).toBe(true);
      expect(result.getError()).toBe(error);
    });

    it('works with string errors', () => {
      const result = Result.err('bad input');
      expect(result.getError()).toBe('bad input');
    });
  });

  describe('getValue', () => {
    it('throws when called on an error result', () => {
      const result = Result.err(new Error('oops'));
      expect(() => result.getValue()).toThrow('Cannot get value from error result');
    });
  });

  describe('getError', () => {
    it('throws when called on a success result', () => {
      const result = Result.ok('fine');
      expect(() => result.getError()).toThrow('Cannot get error from success result');
    });
  });
});
