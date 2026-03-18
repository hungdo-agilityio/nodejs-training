/**
 * Bookings E2E tests
 *
 * Prerequisites (set in .env.test):
 *   CLERK_SECRET_KEY      — Clerk dev/test instance secret key
 *   CLERK_TEST_SESSION_TOKEN — Bearer token for a signed-in test user
 *   CLERK_TEST_USER_ID    — The Clerk user ID matching the token (e.g. user_xxx)
 *
 * How to get CLERK_TEST_SESSION_TOKEN:
 *   1. Sign in to your app with the test user
 *   2. Open DevTools → Application → Cookies → find __session
 *      OR Network → any API request → Authorization header
 *   3. Copy that token into .env.test
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { getRequest } from './setup/global';
import { TEST_IDS, getFutureMonday } from './setup/seed';

const AUTH_TOKEN = process.env.CLERK_TEST_SESSION_TOKEN;
const FUTURE_MONDAY = getFutureMonday();
const APPOINTMENT_TIME = '10:00'; // Within Mon–Fri 09:00–18:00

/** Sets Authorization header when a token is available */
const withAuth = (req: ReturnType<ReturnType<typeof getRequest>['get']>) =>
  AUTH_TOKEN ? req.set('Authorization', `Bearer ${AUTH_TOKEN}`) : req;

// Skip the whole suite if no token is configured — avoids noisy 401 failures
const describeWithAuth = AUTH_TOKEN
  ? describe
  : describe.skip.bind(describe, 'no CLERK_TEST_SESSION_TOKEN');

describe('Bookings API — unauthenticated', () => {
  it('GET /api/bookings returns 401 without a token', async () => {
    const res = await getRequest().get('/api/bookings');
    expect(res.status).toBe(401);
  });

  it('POST /api/bookings returns 401 without a token', async () => {
    const res = await getRequest()
      .post('/api/bookings')
      .send({
        serviceIds: [TEST_IDS.HAIRCUT_SERVICE],
        appointmentDate: FUTURE_MONDAY,
        appointmentTime: APPOINTMENT_TIME,
        paymentMethod: 'CASH',
      });
    expect(res.status).toBe(401);
  });

  it('GET /api/bookings/:id returns 401 without a token', async () => {
    const res = await getRequest().get('/api/bookings/some-id');
    expect(res.status).toBe(401);
  });
});

describeWithAuth('Bookings API — authenticated (real Clerk token)', () => {
  let createdBookingId: string;

  // ─── List ────────────────────────────────────────────────────────────────────

  describe('GET /api/bookings', () => {
    it('returns 200 with data and meta', async () => {
      const res = await withAuth(getRequest().get('/api/bookings'));

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('meta');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('meta contains pagination fields', async () => {
      const res = await withAuth(getRequest().get('/api/bookings'));

      expect(res.status).toBe(200);
      expect(res.body.meta).toMatchObject({
        total: expect.any(Number),
        page: expect.any(Number),
        limit: expect.any(Number),
        totalPages: expect.any(Number),
      });
    });

    it('accepts status filter', async () => {
      const res = await withAuth(
        getRequest().get('/api/bookings?status=CONFIRMED')
      );

      expect(res.status).toBe(200);
      // All returned bookings must match the filter
      for (const booking of res.body.data) {
        expect(booking.status).toBe('CONFIRMED');
      }
    });

    it('accepts sort_by=upcoming', async () => {
      const res = await withAuth(
        getRequest().get('/api/bookings?sort_by=upcoming')
      );
      expect(res.status).toBe(200);
    });
  });

  // ─── Create ──────────────────────────────────────────────────────────────────

  describe('POST /api/bookings', () => {
    it('returns 400 when serviceIds is empty', async () => {
      const res = await withAuth(
        getRequest().post('/api/bookings').send({
          serviceIds: [],
          appointmentDate: FUTURE_MONDAY,
          appointmentTime: APPOINTMENT_TIME,
          paymentMethod: 'CASH',
        })
      );

      expect(res.status).toBe(400);
    });

    it('returns 400 for an invalid appointmentTime format', async () => {
      const res = await withAuth(
        getRequest()
          .post('/api/bookings')
          .send({
            serviceIds: [TEST_IDS.HAIRCUT_SERVICE],
            appointmentDate: FUTURE_MONDAY,
            appointmentTime: '9:00', // must be HH:MM
            paymentMethod: 'CASH',
          })
      );

      expect(res.status).toBe(400);
    });

    it('returns 400 for a past appointmentDate', async () => {
      const res = await withAuth(
        getRequest()
          .post('/api/bookings')
          .send({
            serviceIds: [TEST_IDS.HAIRCUT_SERVICE],
            appointmentDate: '2020-01-01',
            appointmentTime: APPOINTMENT_TIME,
            paymentMethod: 'CASH',
          })
      );

      expect(res.status).toBe(400);
    });

    it('returns 404 when serviceId does not exist', async () => {
      const res = await withAuth(
        getRequest()
          .post('/api/bookings')
          .send({
            serviceIds: ['00000000-0000-0000-0000-000000000000'],
            appointmentDate: FUTURE_MONDAY,
            appointmentTime: APPOINTMENT_TIME,
            paymentMethod: 'CASH',
          })
      );

      expect(res.status).toBe(404);
    });

    it('creates a CASH booking and returns 201', async () => {
      const res = await withAuth(
        getRequest()
          .post('/api/bookings')
          .send({
            serviceIds: [TEST_IDS.HAIRCUT_SERVICE],
            appointmentDate: FUTURE_MONDAY,
            appointmentTime: APPOINTMENT_TIME,
            paymentMethod: 'CASH',
            notes: 'E2E test booking',
          })
      );

      expect(res.status).toBe(201);
      expect(res.body.data).toMatchObject({
        id: expect.any(String),
        appointmentDate: FUTURE_MONDAY,
        appointmentTime: APPOINTMENT_TIME,
        status: 'CONFIRMED', // CASH → CONFIRMED
        totalPrice: 25,
        totalDurationMinutes: 30,
      });

      createdBookingId = res.body.data.id;
    });
  });

  // ─── Get by ID ───────────────────────────────────────────────────────────────

  describe('GET /api/bookings/:id', () => {
    beforeAll(() => {
      if (!createdBookingId) {
        console.warn('Skipping GET /:id tests — booking was not created');
      }
    });

    it('returns 404 for a non-existent ID', async () => {
      const res = await withAuth(
        getRequest().get('/api/bookings/00000000-0000-0000-0000-000000000000')
      );
      expect(res.status).toBe(404);
    });

    it('returns 200 with full booking details', async () => {
      if (!createdBookingId) return;

      const res = await withAuth(
        getRequest().get(`/api/bookings/${createdBookingId}`)
      );

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject({
        id: createdBookingId,
        appointmentDate: FUTURE_MONDAY,
        appointmentTime: APPOINTMENT_TIME,
        status: 'CONFIRMED',
        services: expect.any(Array),
      });
    });

    it('booking details include service info', async () => {
      if (!createdBookingId) return;

      const res = await withAuth(
        getRequest().get(`/api/bookings/${createdBookingId}`)
      );

      expect(res.status).toBe(200);
      expect(res.body.data.services.length).toBeGreaterThan(0);
      expect(res.body.data.services[0]).toMatchObject({
        name: expect.any(String),
        price: expect.any(Number),
        durationMinutes: expect.any(Number),
      });
    });
  });

  // ─── Cancel ──────────────────────────────────────────────────────────────────

  describe('POST /api/bookings/:id/cancel', () => {
    it('returns 404 for a non-existent booking', async () => {
      const res = await withAuth(
        getRequest().post(
          '/api/bookings/00000000-0000-0000-0000-000000000000/cancel'
        )
      );
      expect(res.status).toBe(404);
    });

    it('cancels a CONFIRMED CASH booking', async () => {
      if (!createdBookingId) return;

      const res = await withAuth(
        getRequest().post(`/api/bookings/${createdBookingId}/cancel`)
      );

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject({
        id: createdBookingId,
        status: 'CANCELLED',
        paymentMethod: 'CASH',
        refundInitiated: false,
      });
    });

    it('returns 400 when trying to cancel an already-cancelled booking', async () => {
      if (!createdBookingId) return;

      const res = await withAuth(
        getRequest().post(`/api/bookings/${createdBookingId}/cancel`)
      );

      expect(res.status).toBe(400);
    });
  });
});
