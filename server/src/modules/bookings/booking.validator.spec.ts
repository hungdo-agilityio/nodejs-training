import { describe, it, expect } from 'vitest';
import { BookingValidator } from './booking.validator';

describe('BookingValidator', () => {
  describe('validateCreate', () => {
    const validBody = {
      serviceIds: ['svc-1', 'svc-2'],
      appointmentDate: '2026-03-01',
      appointmentTime: '10:00',
      paymentMethod: 'CASH',
    };

    it('returns valid for a complete CASH booking', () => {
      const result = BookingValidator.validateCreate(validBody);
      expect(result.valid).toBe(true);
    });

    it('returns valid for a STRIPE booking with stripePaymentIntentId', () => {
      const result = BookingValidator.validateCreate({
        ...validBody,
        paymentMethod: 'STRIPE',
        stripePaymentIntentId: 'pi_abc123',
      });
      expect(result.valid).toBe(true);
    });

    it('returns error when serviceIds is empty', () => {
      const result = BookingValidator.validateCreate({ ...validBody, serviceIds: [] });
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error.message).toContain('serviceIds');
      }
    });

    it('returns error when serviceIds is not an array', () => {
      const result = BookingValidator.validateCreate({ ...validBody, serviceIds: 'svc-1' });
      expect(result.valid).toBe(false);
    });

    it('returns error when appointmentDate is missing', () => {
      const { appointmentDate: _, ...body } = validBody;
      const result = BookingValidator.validateCreate(body);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error.message).toContain('appointmentDate');
      }
    });

    it('returns error when appointmentTime is missing', () => {
      const { appointmentTime: _, ...body } = validBody;
      const result = BookingValidator.validateCreate(body);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error.message).toContain('appointmentTime');
      }
    });

    it('returns error when paymentMethod is missing', () => {
      const { paymentMethod: _, ...body } = validBody;
      const result = BookingValidator.validateCreate(body);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error.message).toContain('paymentMethod');
      }
    });

    it('returns error when paymentMethod is an invalid enum value', () => {
      const result = BookingValidator.validateCreate({
        ...validBody,
        paymentMethod: 'BITCOIN',
      });
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error.message).toContain('paymentMethod');
      }
    });

    it('returns error when STRIPE is used without stripePaymentIntentId', () => {
      const result = BookingValidator.validateCreate({
        ...validBody,
        paymentMethod: 'STRIPE',
      });
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error.message).toContain('stripePaymentIntentId');
      }
    });

    it('returns a 400 ApiError on failure', () => {
      const result = BookingValidator.validateCreate({ ...validBody, serviceIds: [] });
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error.statusCode).toBe(400);
        expect(result.error.code).toBe('VALIDATION_ERROR');
      }
    });
  });

  describe('validateGetBookings', () => {
    it('returns valid when no status filter is provided', () => {
      const result = BookingValidator.validateGetBookings({});
      expect(result.valid).toBe(true);
    });

    it('returns valid for a valid status enum value', () => {
      const result = BookingValidator.validateGetBookings({ status: 'CONFIRMED' });
      expect(result.valid).toBe(true);
    });

    it('returns valid for all known statuses', () => {
      const statuses = ['PENDING_PAYMENT', 'AUTHORIZED', 'CONFIRMED', 'CHECKED_IN', 'DONE', 'CANCELLED', 'NO_SHOW', 'PAYMENT_FAILED'];
      for (const status of statuses) {
        const result = BookingValidator.validateGetBookings({ status });
        expect(result.valid).toBe(true);
      }
    });

    it('returns error for an unknown status', () => {
      const result = BookingValidator.validateGetBookings({ status: 'EXPIRED' });
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error.message).toContain('status');
      }
    });
  });
});
