import { describe, it, expect } from 'vitest';
import { BookingValidator } from './booking.validator';
import { BookingStatus, PaymentMethod } from '@/shared/types';

describe('BookingValidator', () => {
  describe('validateCreate', () => {
    const validBody = {
      serviceIds: ['svc-1', 'svc-2'],
      appointmentDate: '2026-03-01',
      appointmentTime: '10:00',
      paymentMethod: PaymentMethod.CASH,
    };

    it('returns valid for a complete CASH booking', () => {
      const result = BookingValidator.validateCreate(validBody);
      expect(result.valid).toBe(true);
    });

    it('returns valid for a STRIPE booking with stripePaymentIntentId', () => {
      const result = BookingValidator.validateCreate({
        ...validBody,
        paymentMethod: PaymentMethod.STRIPE,
        stripePaymentIntentId: 'pi_abc123',
      });
      expect(result.valid).toBe(true);
    });

    it('returns error when serviceIds is empty', () => {
      const result = BookingValidator.validateCreate({
        ...validBody,
        serviceIds: [],
      });
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error.message).toContain('serviceIds');
      }
    });

    it('returns error when serviceIds is not an array', () => {
      const result = BookingValidator.validateCreate({
        ...validBody,
        serviceIds: 'svc-1',
      });
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
        paymentMethod: PaymentMethod.STRIPE,
      });
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error.message).toContain('stripePaymentIntentId');
      }
    });

    it('returns a 400 ApiError on failure', () => {
      const result = BookingValidator.validateCreate({
        ...validBody,
        serviceIds: [],
      });
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
      const result = BookingValidator.validateGetBookings({
        status: BookingStatus.CONFIRMED,
      });
      expect(result.valid).toBe(true);
    });

    it('returns valid for all known statuses', () => {
      const statuses = [
        BookingStatus.PENDING_PAYMENT,
        BookingStatus.AUTHORIZED,
        BookingStatus.CONFIRMED,
        BookingStatus.CHECKED_IN,
        'DONE',
        'CANCELLED',
        'NO_SHOW',
        'PAYMENT_FAILED',
      ];
      for (const status of statuses) {
        const result = BookingValidator.validateGetBookings({ status });
        expect(result.valid).toBe(true);
      }
    });

    it('returns error for an unknown status', () => {
      const result = BookingValidator.validateGetBookings({
        status: 'EXPIRED',
      });
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error.message).toContain('status');
      }
    });
  });

  describe('validateDateParam', () => {
    it('returns valid for a properly formatted date', () => {
      expect(BookingValidator.validateDateParam('2026-03-15').valid).toBe(true);
    });

    it('returns error for date without dashes', () => {
      const result = BookingValidator.validateDateParam('20260315');
      expect(result.valid).toBe(false);
      if (!result.valid) expect(result.error.statusCode).toBe(400);
    });

    it('returns error for partial date string', () => {
      expect(BookingValidator.validateDateParam('2026-03').valid).toBe(false);
    });

    it('returns error for empty string', () => {
      expect(BookingValidator.validateDateParam('').valid).toBe(false);
    });
  });

  describe('validateDateTimeParams', () => {
    const futureDate = new Date(Date.now() + 86400000)
      .toISOString()
      .split('T')[0];

    it('returns valid for future date and valid time', () => {
      expect(
        BookingValidator.validateDateTimeParams(futureDate, '10:00').valid
      ).toBe(true);
    });

    it('returns error for invalid date format', () => {
      const result = BookingValidator.validateDateTimeParams(
        '03/15/2026',
        '10:00'
      );
      expect(result.valid).toBe(false);
      if (!result.valid) expect(result.error.message).toContain('date format');
    });

    it('returns error for invalid time format', () => {
      const result = BookingValidator.validateDateTimeParams(
        futureDate,
        '25:00'
      );
      expect(result.valid).toBe(false);
      if (!result.valid) expect(result.error.message).toContain('time format');
    });

    it('returns error for a past time slot', () => {
      const result = BookingValidator.validateDateTimeParams(
        '2020-01-01',
        '09:00'
      );
      expect(result.valid).toBe(false);
      if (!result.valid) expect(result.error.message).toContain('past');
    });
  });

  describe('validateCheckIn', () => {
    it('returns valid for a CASH booking in CONFIRMED status', () => {
      const result = BookingValidator.validateCheckIn({
        paymentMethod: PaymentMethod.CASH,
        status: BookingStatus.CONFIRMED,
        stripePaymentIntentId: null,
      });
      expect(result.valid).toBe(true);
    });

    it('returns valid for a STRIPE booking in AUTHORIZED status with payment intent', () => {
      const result = BookingValidator.validateCheckIn({
        paymentMethod: PaymentMethod.STRIPE,
        status: BookingStatus.AUTHORIZED,
        stripePaymentIntentId: 'pi_abc',
      });
      expect(result.valid).toBe(true);
    });

    it('returns error for CASH booking not in CONFIRMED status', () => {
      const result = BookingValidator.validateCheckIn({
        paymentMethod: PaymentMethod.CASH,
        status: BookingStatus.PENDING_PAYMENT,
        stripePaymentIntentId: null,
      });
      expect(result.valid).toBe(false);
      if (!result.valid)
        expect(result.error.message).toContain(BookingStatus.CONFIRMED);
    });

    it('returns error for STRIPE booking not in AUTHORIZED status', () => {
      const result = BookingValidator.validateCheckIn({
        paymentMethod: PaymentMethod.STRIPE,
        status: BookingStatus.CONFIRMED,
        stripePaymentIntentId: 'pi_abc',
      });
      expect(result.valid).toBe(false);
      if (!result.valid)
        expect(result.error.message).toContain(BookingStatus.AUTHORIZED);
    });

    it('returns error for STRIPE booking missing payment intent ID', () => {
      const result = BookingValidator.validateCheckIn({
        paymentMethod: PaymentMethod.STRIPE,
        status: BookingStatus.AUTHORIZED,
        stripePaymentIntentId: null,
      });
      expect(result.valid).toBe(false);
      if (!result.valid)
        expect(result.error.message).toContain('payment intent');
    });
  });

  describe('validateComplete', () => {
    it('returns valid for CHECKED_IN booking', () => {
      expect(
        BookingValidator.validateComplete({ status: BookingStatus.CHECKED_IN })
          .valid
      ).toBe(true);
    });

    it('returns error for booking not in CHECKED_IN status', () => {
      const result = BookingValidator.validateComplete({
        status: BookingStatus.CONFIRMED,
      });
      expect(result.valid).toBe(false);
      if (!result.valid)
        expect(result.error.message).toContain(BookingStatus.CHECKED_IN);
    });
  });

  describe('validateNoShow', () => {
    it('returns valid for CONFIRMED booking', () => {
      expect(
        BookingValidator.validateNoShow({ status: BookingStatus.CONFIRMED })
          .valid
      ).toBe(true);
    });

    it('returns valid for AUTHORIZED booking', () => {
      expect(
        BookingValidator.validateNoShow({ status: BookingStatus.AUTHORIZED })
          .valid
      ).toBe(true);
    });

    it('returns error for booking in disallowed status', () => {
      const result = BookingValidator.validateNoShow({
        status: BookingStatus.CHECKED_IN,
      });
      expect(result.valid).toBe(false);
      if (!result.valid)
        expect(result.error.message).toContain('CONFIRMED or AUTHORIZED');
    });
  });

  describe('validateCancel', () => {
    const farFuture = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now

    it('returns valid for CONFIRMED booking with future appointment', () => {
      const result = BookingValidator.validateCancel({
        status: BookingStatus.CONFIRMED,
        appointmentDatetime: farFuture,
      });
      expect(result.valid).toBe(true);
    });

    it('returns valid for AUTHORIZED booking with future appointment', () => {
      const result = BookingValidator.validateCancel({
        status: BookingStatus.AUTHORIZED,
        appointmentDatetime: farFuture,
      });
      expect(result.valid).toBe(true);
    });

    it('returns valid for PENDING_PAYMENT booking with future appointment', () => {
      const result = BookingValidator.validateCancel({
        status: BookingStatus.PENDING_PAYMENT,
        appointmentDatetime: farFuture,
      });
      expect(result.valid).toBe(true);
    });

    it('returns error for booking in non-cancellable status', () => {
      const result = BookingValidator.validateCancel({
        status: BookingStatus.DONE,
        appointmentDatetime: farFuture,
      });
      expect(result.valid).toBe(false);
      if (!result.valid) expect(result.error.message).toContain('cancelled');
    });

    it('returns error when appointment is within 15 minutes', () => {
      const soonAppointment = new Date(Date.now() + 5 * 60 * 1000); // 5 min from now
      const result = BookingValidator.validateCancel({
        status: BookingStatus.CONFIRMED,
        appointmentDatetime: soonAppointment,
      });
      expect(result.valid).toBe(false);
      if (!result.valid) expect(result.error.message).toContain('15 minutes');
    });
  });
});
