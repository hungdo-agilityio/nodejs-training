import { describe, it, expect } from 'vitest';
import { PaymentValidator } from './payment.validator';

describe('PaymentValidator', () => {
  describe('validateAuthorize', () => {
    it('returns valid for a complete body', () => {
      const result = PaymentValidator.validateAuthorize({
        bookingId: 'booking-123',
        idempotencyKey: 'idem-key-abc',
      });
      expect(result.valid).toBe(true);
    });

    it('returns error when bookingId is missing', () => {
      const result = PaymentValidator.validateAuthorize({
        idempotencyKey: 'key',
      });
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error.message).toContain('bookingId');
        expect(result.error.statusCode).toBe(400);
      }
    });

    it('returns error when idempotencyKey is missing', () => {
      const result = PaymentValidator.validateAuthorize({ bookingId: 'b-123' });
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error.message).toContain('idempotencyKey');
      }
    });

    it('returns error when both fields are missing', () => {
      const result = PaymentValidator.validateAuthorize({});
      expect(result.valid).toBe(false);
    });
  });

  describe('validateCreateIntent', () => {
    const validBody = {
      serviceIds: ['svc-1'],
      appointmentDate: '2026-03-01',
      appointmentTime: '10:00',
    };

    it('returns valid for a complete body', () => {
      const result = PaymentValidator.validateCreateIntent(validBody);
      expect(result.valid).toBe(true);
    });

    it('returns error when serviceIds is empty', () => {
      const result = PaymentValidator.validateCreateIntent({
        ...validBody,
        serviceIds: [],
      });
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error.message).toContain('serviceIds');
      }
    });

    it('returns error when serviceIds is not an array', () => {
      const result = PaymentValidator.validateCreateIntent({
        ...validBody,
        serviceIds: 'svc-1',
      });
      expect(result.valid).toBe(false);
    });

    it('returns error when appointmentDate is missing', () => {
      const { appointmentDate: _, ...body } = validBody;
      const result = PaymentValidator.validateCreateIntent(body);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error.message).toContain('appointmentDate');
      }
    });

    it('returns error when appointmentTime is missing', () => {
      const { appointmentTime: _, ...body } = validBody;
      const result = PaymentValidator.validateCreateIntent(body);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error.message).toContain('appointmentTime');
      }
    });
  });
});
