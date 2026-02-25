import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BookingBusinessService } from './booking.service';
import { BookingStatus, PaymentMethod } from '@shared/types';

// --- Mocks ---
const mockBookingRepository = {
  find: vi.fn(),
  findOne: vi.fn(),
  create: vi.fn(),
  save: vi.fn(),
  update: vi.fn(),
  createQueryBuilder: vi.fn(),
};

const mockServiceRepository = {
  find: vi.fn(),
};

const mockStripeService = {
  capturePayment: vi.fn(),
  cancelPaymentIntent: vi.fn(),
};

const mockDataSource = {
  transaction: vi.fn(),
};

const mockLogger = {
  log: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

// A future appointment datetime for tests
const futureDate = '2099-12-31';
const futureTime = '10:00';

describe('BookingBusinessService', () => {
  let service: BookingBusinessService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new BookingBusinessService(
      mockBookingRepository as never,
      mockServiceRepository as never,
      mockStripeService as never,
      mockLogger,
      mockDataSource as never
    );
  });

  // ─── generateIdempotencyKey ───────────────────────────────────────────────
  describe('generateIdempotencyKey', () => {
    const dto = {
      userId: 'user-1',
      serviceIds: ['svc-a', 'svc-b'],
      appointmentDate: futureDate,
      appointmentTime: futureTime,
      paymentMethod: PaymentMethod.CASH,
    };

    it('generates a key with the booking_ prefix', () => {
      const key = service.generateIdempotencyKey(dto);
      expect(key).toMatch(/^booking_[a-f0-9]{32}$/);
    });

    it('generates the same key for the same input', () => {
      const key1 = service.generateIdempotencyKey(dto);
      const key2 = service.generateIdempotencyKey(dto);
      expect(key1).toBe(key2);
    });

    it('generates different keys for different service orderings (sorted internally)', () => {
      const keyA = service.generateIdempotencyKey({
        ...dto,
        serviceIds: ['svc-a', 'svc-b'],
      });
      const keyB = service.generateIdempotencyKey({
        ...dto,
        serviceIds: ['svc-b', 'svc-a'],
      });
      // serviceIds are sorted before hashing, so same order → same key
      expect(keyA).toBe(keyB);
    });

    it('generates different keys for different users', () => {
      const key1 = service.generateIdempotencyKey({ ...dto, userId: 'user-1' });
      const key2 = service.generateIdempotencyKey({ ...dto, userId: 'user-2' });
      expect(key1).not.toBe(key2);
    });

    it('generates different keys for different dates', () => {
      const key1 = service.generateIdempotencyKey({
        ...dto,
        appointmentDate: '2099-12-31',
      });
      const key2 = service.generateIdempotencyKey({
        ...dto,
        appointmentDate: '2099-12-30',
      });
      expect(key1).not.toBe(key2);
    });
  });

  // ─── validateServicesAndCalculateTotals ──────────────────────────────────
  describe('validateServicesAndCalculateTotals', () => {
    it('returns totals for valid services', async () => {
      mockServiceRepository.find.mockResolvedValue([
        { id: 'svc-1', name: 'Haircut', price: 25, durationMinutes: 30 },
        { id: 'svc-2', name: 'Coloring', price: 80, durationMinutes: 90 },
      ]);

      const result = await service.validateServicesAndCalculateTotals([
        'svc-1',
        'svc-2',
      ]);

      expect(result.isOk()).toBe(true);
      const value = result.getValue();
      expect(value.totalPrice).toBe(105);
      expect(value.totalDurationMinutes).toBe(120);
      expect(value.services).toHaveLength(2);
    });

    it('returns validation error when serviceIds is empty', async () => {
      const result = await service.validateServicesAndCalculateTotals([]);

      expect(result.isErr()).toBe(true);
      expect(result.getError().statusCode).toBe(400);
      expect(result.getError().message).toContain('At least one service');
    });

    it('returns 404 when some services are not found', async () => {
      mockServiceRepository.find.mockResolvedValue([
        { id: 'svc-1', name: 'Haircut', price: 25, durationMinutes: 30 },
      ]);

      const result = await service.validateServicesAndCalculateTotals([
        'svc-1',
        'svc-missing',
      ]);

      expect(result.isErr()).toBe(true);
      expect(result.getError().statusCode).toBe(404);
    });

    it('deduplicates service IDs before fetching', async () => {
      mockServiceRepository.find.mockResolvedValue([
        { id: 'svc-1', name: 'Haircut', price: 25, durationMinutes: 30 },
      ]);

      const result = await service.validateServicesAndCalculateTotals([
        'svc-1',
        'svc-1',
      ]);

      expect(result.isOk()).toBe(true);
      expect(result.getValue().totalPrice).toBe(25);
    });

    it('returns internal error when repository throws', async () => {
      mockServiceRepository.find.mockRejectedValue(new Error('DB error'));

      const result = await service.validateServicesAndCalculateTotals([
        'svc-1',
      ]);

      expect(result.isErr()).toBe(true);
      expect(result.getError().statusCode).toBe(500);
    });
  });

  // ─── checkCapacityAvailability ───────────────────────────────────────────
  describe('checkCapacityAvailability', () => {
    it('returns true when no bookings overlap', async () => {
      mockBookingRepository.find.mockResolvedValue([]);

      const result = await service.checkCapacityAvailability(
        futureDate,
        futureTime,
        60
      );

      expect(result.isOk()).toBe(true);
      expect(result.getValue()).toBe(true);
    });

    it('returns conflict error when slot is at capacity', async () => {
      // DEFAULT_CAPACITY = 1, so one overlapping booking fills capacity
      const appointmentDatetime = new Date(`${futureDate}T${futureTime}:00`);
      mockBookingRepository.find.mockResolvedValue([
        { appointmentDatetime, totalDurationMinutes: 60 },
      ]);

      const result = await service.checkCapacityAvailability(
        futureDate,
        futureTime,
        60
      );

      expect(result.isErr()).toBe(true);
      expect(result.getError().statusCode).toBe(409);
    });

    it('returns validation error for invalid date format', async () => {
      const result = await service.checkCapacityAvailability(
        '31-12-2099',
        futureTime,
        60
      );

      expect(result.isErr()).toBe(true);
      expect(result.getError().statusCode).toBe(400);
      expect(result.getError().message).toContain('date format');
    });

    it('returns validation error for invalid time format', async () => {
      const result = await service.checkCapacityAvailability(
        futureDate,
        '9:00',
        60
      );

      expect(result.isErr()).toBe(true);
      expect(result.getError().statusCode).toBe(400);
      expect(result.getError().message).toContain('time format');
    });

    it('returns validation error for past appointment time', async () => {
      const result = await service.checkCapacityAvailability(
        '2020-01-01',
        '09:00',
        60
      );

      expect(result.isErr()).toBe(true);
      expect(result.getError().statusCode).toBe(400);
      expect(result.getError().message).toContain('past');
    });
  });

  // ─── cancelBooking ───────────────────────────────────────────────────────
  describe('cancelBooking', () => {
    const bookingId = 'booking-1';
    const userId = 'user-1';

    const makeBooking = (overrides = {}) => ({
      id: bookingId,
      userId,
      status: BookingStatus.CONFIRMED,
      paymentMethod: PaymentMethod.CASH,
      stripePaymentIntentId: null,
      totalPrice: '50.00',
      appointmentDatetime: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
      ...overrides,
    });

    it('successfully cancels a CONFIRMED booking', async () => {
      mockBookingRepository.findOne.mockResolvedValue(makeBooking());
      mockBookingRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.cancelBooking(bookingId, userId);

      expect(result.isOk()).toBe(true);
      expect(result.getValue().status).toBe(BookingStatus.CANCELLED);
      expect(result.getValue().previousStatus).toBe(BookingStatus.CONFIRMED);
    });

    it('returns 404 when booking is not found', async () => {
      mockBookingRepository.findOne.mockResolvedValue(null);

      const result = await service.cancelBooking(bookingId, userId);

      expect(result.isErr()).toBe(true);
      expect(result.getError().statusCode).toBe(404);
    });

    it('returns 403 when user does not own the booking', async () => {
      mockBookingRepository.findOne.mockResolvedValue(
        makeBooking({ userId: 'other-user' })
      );

      const result = await service.cancelBooking(bookingId, userId);

      expect(result.isErr()).toBe(true);
      expect(result.getError().statusCode).toBe(403);
    });

    it('returns validation error for non-cancellable status', async () => {
      mockBookingRepository.findOne.mockResolvedValue(
        makeBooking({ status: BookingStatus.DONE })
      );

      const result = await service.cancelBooking(bookingId, userId);

      expect(result.isErr()).toBe(true);
      expect(result.getError().statusCode).toBe(400);
      expect(result.getError().message).toContain('cannot be cancelled');
    });

    it('returns validation error when within 15-minute cutoff', async () => {
      // Appointment is only 5 minutes from now
      const nearFuture = new Date(Date.now() + 5 * 60 * 1000);
      mockBookingRepository.findOne.mockResolvedValue(
        makeBooking({ appointmentDatetime: nearFuture })
      );

      const result = await service.cancelBooking(bookingId, userId);

      expect(result.isErr()).toBe(true);
      expect(result.getError().statusCode).toBe(400);
      expect(result.getError().message).toContain('15 minutes');
    });

    it('can cancel AUTHORIZED and PENDING_PAYMENT bookings too', async () => {
      for (const status of [
        BookingStatus.AUTHORIZED,
        BookingStatus.PENDING_PAYMENT,
      ]) {
        vi.clearAllMocks();
        mockBookingRepository.findOne.mockResolvedValue(
          makeBooking({ status })
        );
        mockBookingRepository.update.mockResolvedValue({ affected: 1 });

        const result = await service.cancelBooking(bookingId, userId);

        expect(result.isOk()).toBe(true);
        expect(result.getValue().previousStatus).toBe(status);
      }
    });
  });

  // ─── checkInBooking ───────────────────────────────────────────────────────
  describe('checkInBooking', () => {
    const bookingId = 'booking-1';

    it('checks in a CONFIRMED cash booking', async () => {
      mockBookingRepository.findOne.mockResolvedValue({
        id: bookingId,
        status: BookingStatus.CONFIRMED,
        paymentMethod: PaymentMethod.CASH,
        stripePaymentIntentId: null,
      });
      mockBookingRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.checkInBooking(bookingId);

      expect(result.isOk()).toBe(true);
      expect(result.getValue().status).toBe(BookingStatus.CHECKED_IN);
    });

    it('checks in an AUTHORIZED stripe booking and captures payment', async () => {
      mockBookingRepository.findOne.mockResolvedValue({
        id: bookingId,
        status: BookingStatus.AUTHORIZED,
        paymentMethod: PaymentMethod.STRIPE,
        stripePaymentIntentId: 'pi_abc',
      });
      mockStripeService.capturePayment.mockResolvedValue({
        isErr: () => false,
        getValue: () => ({}),
      });
      mockBookingRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.checkInBooking(bookingId);

      expect(mockStripeService.capturePayment).toHaveBeenCalledWith('pi_abc');
      expect(result.isOk()).toBe(true);
    });

    it('returns 404 when booking not found', async () => {
      mockBookingRepository.findOne.mockResolvedValue(null);

      const result = await service.checkInBooking(bookingId);

      expect(result.isErr()).toBe(true);
      expect(result.getError().statusCode).toBe(404);
    });

    it('returns validation error when cash booking is not CONFIRMED', async () => {
      mockBookingRepository.findOne.mockResolvedValue({
        id: bookingId,
        status: BookingStatus.PENDING_PAYMENT,
        paymentMethod: PaymentMethod.CASH,
        stripePaymentIntentId: null,
      });

      const result = await service.checkInBooking(bookingId);

      expect(result.isErr()).toBe(true);
      expect(result.getError().statusCode).toBe(400);
      expect(result.getError().message).toContain('CONFIRMED');
    });

    it('returns validation error when stripe booking is not AUTHORIZED', async () => {
      mockBookingRepository.findOne.mockResolvedValue({
        id: bookingId,
        status: BookingStatus.CONFIRMED,
        paymentMethod: PaymentMethod.STRIPE,
        stripePaymentIntentId: 'pi_abc',
      });

      const result = await service.checkInBooking(bookingId);

      expect(result.isErr()).toBe(true);
      expect(result.getError().statusCode).toBe(400);
      expect(result.getError().message).toContain('AUTHORIZED');
    });

    it('returns internal error when stripe capture fails', async () => {
      const { Result } = await import('@shared/utils');
      const { ApiError } = await import('@shared/errors');
      mockBookingRepository.findOne.mockResolvedValue({
        id: bookingId,
        status: BookingStatus.AUTHORIZED,
        paymentMethod: PaymentMethod.STRIPE,
        stripePaymentIntentId: 'pi_abc',
      });
      mockStripeService.capturePayment.mockResolvedValue(
        Result.err(ApiError.internalError('Stripe down'))
      );

      const result = await service.checkInBooking(bookingId);

      expect(result.isErr()).toBe(true);
      expect(result.getError().statusCode).toBe(500);
    });
  });

  // ─── completeBooking ─────────────────────────────────────────────────────
  describe('completeBooking', () => {
    const bookingId = 'booking-1';

    it('completes a CHECKED_IN booking', async () => {
      mockBookingRepository.findOne.mockResolvedValue({
        id: bookingId,
        status: BookingStatus.CHECKED_IN,
      });
      mockBookingRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.completeBooking(bookingId);

      expect(result.isOk()).toBe(true);
      expect(result.getValue().status).toBe(BookingStatus.DONE);
    });

    it('returns 404 when booking not found', async () => {
      mockBookingRepository.findOne.mockResolvedValue(null);

      const result = await service.completeBooking(bookingId);

      expect(result.isErr()).toBe(true);
      expect(result.getError().statusCode).toBe(404);
    });

    it('returns validation error when booking is not CHECKED_IN', async () => {
      mockBookingRepository.findOne.mockResolvedValue({
        id: bookingId,
        status: BookingStatus.CONFIRMED,
      });

      const result = await service.completeBooking(bookingId);

      expect(result.isErr()).toBe(true);
      expect(result.getError().statusCode).toBe(400);
      expect(result.getError().message).toContain('CHECKED_IN');
    });
  });

  // ─── noShowBooking ────────────────────────────────────────────────────────
  describe('noShowBooking', () => {
    const bookingId = 'booking-1';

    it('marks a CONFIRMED booking as NO_SHOW', async () => {
      mockBookingRepository.findOne.mockResolvedValue({
        id: bookingId,
        status: BookingStatus.CONFIRMED,
        paymentMethod: PaymentMethod.CASH,
      });
      mockBookingRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.noShowBooking(bookingId);

      expect(result.isOk()).toBe(true);
      expect(result.getValue().status).toBe(BookingStatus.NO_SHOW);
      expect(result.getValue().previousStatus).toBe(BookingStatus.CONFIRMED);
    });

    it('marks an AUTHORIZED booking as NO_SHOW', async () => {
      mockBookingRepository.findOne.mockResolvedValue({
        id: bookingId,
        status: BookingStatus.AUTHORIZED,
        paymentMethod: PaymentMethod.STRIPE,
      });
      mockBookingRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.noShowBooking(bookingId);

      expect(result.isOk()).toBe(true);
      expect(result.getValue().previousStatus).toBe(BookingStatus.AUTHORIZED);
    });

    it('returns 404 when booking not found', async () => {
      mockBookingRepository.findOne.mockResolvedValue(null);

      const result = await service.noShowBooking(bookingId);

      expect(result.isErr()).toBe(true);
      expect(result.getError().statusCode).toBe(404);
    });

    it('returns validation error for disallowed statuses', async () => {
      const disallowed = [
        BookingStatus.CHECKED_IN,
        BookingStatus.DONE,
        BookingStatus.CANCELLED,
      ];

      for (const status of disallowed) {
        vi.clearAllMocks();
        mockBookingRepository.findOne.mockResolvedValue({
          id: bookingId,
          status,
        });

        const result = await service.noShowBooking(bookingId);

        expect(result.isErr()).toBe(true);
        expect(result.getError().statusCode).toBe(400);
      }
    });
  });
});
