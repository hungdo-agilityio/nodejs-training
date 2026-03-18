import { describe, it, expect } from 'vitest';
import { DateUtils } from './date';

describe('DateUtils', () => {
  describe('parseLocalDate', () => {
    it('parses a valid date string as local midnight', () => {
      const result = DateUtils.parseLocalDate('2026-03-15');
      expect(result).not.toBeNull();
      expect(result!.getFullYear()).toBe(2026);
      expect(result!.getMonth()).toBe(2); // 0-indexed
      expect(result!.getDate()).toBe(15);
      expect(result!.getHours()).toBe(0);
      expect(result!.getMinutes()).toBe(0);
      expect(result!.getSeconds()).toBe(0);
      expect(result!.getMilliseconds()).toBe(0);
    });

    it('returns the correct day-of-week in local time (not UTC)', () => {
      // 2026-03-15 is a Sunday
      const result = DateUtils.parseLocalDate('2026-03-15');
      expect(result!.getDay()).toBe(0); // Sunday
    });

    it('returns null for a non-date string', () => {
      expect(DateUtils.parseLocalDate('not-a-date')).toBeNull();
    });

    it('returns null for an empty string', () => {
      expect(DateUtils.parseLocalDate('')).toBeNull();
    });

    it('returns null for wrong format (DD-MM-YYYY)', () => {
      expect(DateUtils.parseLocalDate('15-03-2026')).toBeNull();
    });

    it('returns null for wrong format (MM/DD/YYYY)', () => {
      expect(DateUtils.parseLocalDate('03/15/2026')).toBeNull();
    });

    it('returns null for an overflowed date (Feb 30)', () => {
      expect(DateUtils.parseLocalDate('2026-02-30')).toBeNull();
    });

    it('returns null for an overflowed date (month 13)', () => {
      expect(DateUtils.parseLocalDate('2026-13-01')).toBeNull();
    });

    it('returns null for month 00', () => {
      expect(DateUtils.parseLocalDate('2026-00-01')).toBeNull();
    });

    it('parses Feb 28 correctly on a non-leap year', () => {
      const result = DateUtils.parseLocalDate('2026-02-28');
      expect(result).not.toBeNull();
      expect(result!.getDate()).toBe(28);
    });

    it('parses Feb 29 on a leap year', () => {
      const result = DateUtils.parseLocalDate('2024-02-29');
      expect(result).not.toBeNull();
      expect(result!.getDate()).toBe(29);
    });

    it('returns null for Feb 29 on a non-leap year', () => {
      expect(DateUtils.parseLocalDate('2026-02-29')).toBeNull();
    });
  });

  describe('isSameDay', () => {
    it('returns true for two dates on the same local calendar day', () => {
      const a = new Date(2026, 2, 15, 9, 0, 0);
      const b = new Date(2026, 2, 15, 23, 59, 59);
      expect(DateUtils.isSameDay(a, b)).toBe(true);
    });

    it('returns false for dates on different days', () => {
      const a = new Date(2026, 2, 15, 9, 0, 0);
      const b = new Date(2026, 2, 16, 0, 0, 0);
      expect(DateUtils.isSameDay(a, b)).toBe(false);
    });

    it('returns false for same day in different months', () => {
      const a = new Date(2026, 2, 15);
      const b = new Date(2026, 3, 15);
      expect(DateUtils.isSameDay(a, b)).toBe(false);
    });

    it('returns false for same day/month in different years', () => {
      const a = new Date(2025, 2, 15);
      const b = new Date(2026, 2, 15);
      expect(DateUtils.isSameDay(a, b)).toBe(false);
    });

    it('returns true for two identical dates', () => {
      const a = new Date(2026, 2, 15);
      expect(DateUtils.isSameDay(a, a)).toBe(true);
    });
  });
});
