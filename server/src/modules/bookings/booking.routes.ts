import { Router } from 'express';
import { IBookingController } from './booking.controller.interface';
import { createRequireRole } from '@shared/middleware';
import { UserRole } from '@shared/types';

export function createBookingRoutes(controller: IBookingController): Router {
  const router = Router();

  /**
   * @openapi
   * /bookings:
   *   get:
   *     summary: Get user's bookings
   *     description: Retrieves all bookings for the authenticated user with optional filters
   *     tags:
   *       - Bookings
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [PENDING_PAYMENT, CONFIRMED, AUTHORIZED, CHECKED_IN, DONE, CANCELLED, NO_SHOW, PAYMENT_FAILED]
   *         description: Filter by booking status
   *       - in: query
   *         name: payment_method
   *         schema:
   *           type: string
   *           enum: [CASH, STRIPE]
   *         description: Filter by payment method
   *       - in: query
   *         name: service_id
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Filter by service ID
   *       - in: query
   *         name: date
   *         schema:
   *           type: string
   *           format: date
   *         description: Filter by specific appointment date (YYYY-MM-DD)
   *       - in: query
   *         name: start_date
   *         schema:
   *           type: string
   *           format: date
   *         description: Filter by date range start (YYYY-MM-DD)
   *       - in: query
   *         name: end_date
   *         schema:
   *           type: string
   *           format: date
   *         description: Filter by date range end (YYYY-MM-DD)
   *       - in: query
   *         name: sort_by
   *         schema:
   *           type: string
   *           enum: [upcoming, recent, past]
   *           default: upcoming
   *         description: Sort order (upcoming = appointment date ASC, recent = created date DESC, past = appointment date DESC)
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *         description: Page number
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 100
   *         description: Items per page
   *     responses:
   *       200:
   *         description: Bookings retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: string
   *                         format: uuid
   *                       servicesCount:
   *                         type: integer
   *                         description: Number of services in the booking
   *                       appointmentDatetime:
   *                         type: string
   *                         format: date-time
   *                       appointmentDate:
   *                         type: string
   *                         format: date
   *                       appointmentTime:
   *                         type: string
   *                         example: "14:30"
   *                       status:
   *                         type: string
   *                         enum: [PENDING_PAYMENT, CONFIRMED, AUTHORIZED, CHECKED_IN, DONE, CANCELLED, NO_SHOW, PAYMENT_FAILED]
   *                       paymentMethod:
   *                         type: string
   *                         enum: [CASH, STRIPE]
   *                       totalPrice:
   *                         type: number
   *                       totalDurationMinutes:
   *                         type: integer
   *                       createdAt:
   *                         type: string
   *                         format: date-time
   *                 meta:
   *                   type: object
   *                   properties:
   *                     total:
   *                       type: integer
   *                     page:
   *                       type: integer
   *                     limit:
   *                       type: integer
   *                     totalPages:
   *                       type: integer
   *       401:
   *         description: Unauthorized - authentication required
   *   post:
   *     summary: Create a new booking
   *     description: |
   *       Creates a new booking with selected services and appointment time.
   *       - For **STRIPE** payments: call `POST /payments/create-intent` first to get a `paymentIntentId`, confirm the card with Stripe Elements, then pass `stripePaymentIntentId` here. Booking will be created with status `AUTHORIZED`.
   *       - For **CASH** payments: no `stripePaymentIntentId` needed. Booking is created with status `CONFIRMED`.
   *       Concurrency is protected via a database-level unique idempotency key.
   *     tags:
   *       - Bookings
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - serviceIds
   *               - appointmentDate
   *               - appointmentTime
   *               - paymentMethod
   *             properties:
   *               serviceIds:
   *                 type: array
   *                 items:
   *                   type: string
   *                   format: uuid
   *                 description: Array of service IDs to book (at least one required)
   *                 example: ["service-uuid-1", "service-uuid-2"]
   *               appointmentDate:
   *                 type: string
   *                 format: date
   *                 description: Appointment date (YYYY-MM-DD)
   *                 example: "2026-02-15"
   *               appointmentTime:
   *                 type: string
   *                 pattern: '^([01][0-9]|2[0-3]):[0-5][0-9]$'
   *                 description: Appointment time in HH:MM 24-hour format
   *                 example: "14:30"
   *               paymentMethod:
   *                 type: string
   *                 enum: [CASH, STRIPE]
   *                 description: Payment method
   *                 example: "STRIPE"
   *               stripePaymentIntentId:
   *                 type: string
   *                 description: Required when paymentMethod is STRIPE. Obtained from POST /payments/create-intent after card confirmation.
   *                 example: "pi_3ABC123xyz"
   *               notes:
   *                 type: string
   *                 description: Optional notes for the booking
   *                 example: "First time customer"
   *     responses:
   *       201:
   *         description: Booking created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: string
   *                       format: uuid
   *                     appointmentDate:
   *                       type: string
   *                       format: date
   *                     appointmentDatetime:
   *                       type: string
   *                       format: date-time
   *                     appointmentTime:
   *                       type: string
   *                       example: "14:30"
   *                     totalPrice:
   *                       type: number
   *                     totalDurationMinutes:
   *                       type: integer
   *                     status:
   *                       type: string
   *                       enum: [PENDING_PAYMENT, CONFIRMED, AUTHORIZED]
   *                       description: AUTHORIZED for STRIPE, CONFIRMED for CASH, PENDING_PAYMENT if no stripePaymentIntentId
   *                     idempotencyKey:
   *                       type: string
   *                       description: Unique key used for duplicate prevention
   *       400:
   *         description: Validation error or business rule violation (invalid services, no capacity, duplicate booking)
   *       401:
   *         description: Unauthorized - authentication required
   *       409:
   *         description: Conflict - booking already exists for this slot
   */
  /**
   * @openapi
   * /bookings/daily:
   *   get:
   *     summary: Get daily bookings for staff
   *     description: Retrieves all bookings for a specific date with customer info and summary. Requires STAFF or ADMIN role.
   *     tags:
   *       - Staff Operations
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: date
   *         schema:
   *           type: string
   *           format: date
   *           example: "2026-02-24"
   *         description: Target date (YYYY-MM-DD). Defaults to today if not provided.
   *       - in: query
   *         name: exclude_completed
   *         schema:
   *           type: boolean
   *           default: false
   *           example: true
   *         description: If true, excludes bookings with status DONE, CANCELLED, or NO_SHOW
   *     responses:
   *       200:
   *         description: Daily bookings retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: string
   *                         format: uuid
   *                       customer:
   *                         type: object
   *                         properties:
   *                           id:
   *                             type: string
   *                           firstName:
   *                             type: string
   *                           lastName:
   *                             type: string
   *                           email:
   *                             type: string
   *                           phoneNumber:
   *                             type: string
   *                             nullable: true
   *                       services:
   *                         type: array
   *                         items:
   *                           type: object
   *                           properties:
   *                             id:
   *                               type: string
   *                             name:
   *                               type: string
   *                             price:
   *                               type: number
   *                             durationMinutes:
   *                               type: integer
   *                       appointmentTime:
   *                         type: string
   *                         example: "14:30"
   *                       status:
   *                         type: string
   *                         enum: [PENDING_PAYMENT, CONFIRMED, AUTHORIZED, CHECKED_IN, DONE, CANCELLED, NO_SHOW, PAYMENT_FAILED]
   *                       paymentMethod:
   *                         type: string
   *                         enum: [CASH, STRIPE]
   *                       totalPrice:
   *                         type: number
   *                       totalDurationMinutes:
   *                         type: integer
   *                       notes:
   *                         type: string
   *                         nullable: true
   *                 summary:
   *                   type: object
   *                   properties:
   *                     totalBookings:
   *                       type: integer
   *                       description: Total number of bookings for the day
   *                     totalRevenue:
   *                       type: number
   *                       description: Total revenue from confirmed/checked-in/completed bookings
   *                     byStatus:
   *                       type: object
   *                       description: Breakdown of bookings by status
   *                       additionalProperties:
   *                         type: integer
   *                 date:
   *                   type: string
   *                   format: date
   *                   description: The date for which bookings were retrieved
   *       400:
   *         description: Bad request - invalid date format
   *       401:
   *         description: Unauthorized - authentication required
   *       403:
   *         description: Forbidden - insufficient permissions (requires STAFF or ADMIN role)
   */
  router.get(
    '/daily',
    createRequireRole(UserRole.STAFF, UserRole.ADMIN),
    (req, res) => controller.getDailyBookings(req, res)
  );

  /**
   * @openapi
   * /bookings/{id}/check-in:
   *   post:
   *     summary: Check in a booking
   *     description: Check in a customer for their appointment. For card payments, captures the payment. Requires STAFF or ADMIN role.
   *     tags:
   *       - Staff Operations
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Booking ID
   *     responses:
   *       200:
   *         description: Booking checked in successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: string
   *                       format: uuid
   *                     status:
   *                       type: string
   *                       enum: [CHECKED_IN]
   *                     checkedInAt:
   *                       type: string
   *                       format: date-time
   *       400:
   *         description: Bad request - invalid status or validation error
   *       404:
   *         description: Booking not found
   *       401:
   *         description: Unauthorized - authentication required
   *       403:
   *         description: Forbidden - insufficient permissions (requires STAFF or ADMIN role)
   *       500:
   *         description: Internal server error - payment capture failed
   */
  router.post(
    '/:id/check-in',
    createRequireRole(UserRole.STAFF, UserRole.ADMIN),
    (req, res) => controller.checkInBooking(req, res)
  );

  /**
   * @openapi
   * /bookings/{id}/complete:
   *   post:
   *     summary: Complete a booking
   *     description: Mark a booking as completed after service is done. Requires STAFF or ADMIN role.
   *     tags:
   *       - Staff Operations
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Booking ID
   *     responses:
   *       200:
   *         description: Booking completed successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: string
   *                       format: uuid
   *                     status:
   *                       type: string
   *                       enum: [DONE]
   *                     completedAt:
   *                       type: string
   *                       format: date-time
   *       400:
   *         description: Bad request - invalid status (must be CHECKED_IN)
   *       404:
   *         description: Booking not found
   *       401:
   *         description: Unauthorized - authentication required
   *       403:
   *         description: Forbidden - insufficient permissions
   */
  router.post(
    '/:id/complete',
    createRequireRole(UserRole.STAFF, UserRole.ADMIN),
    (req, res) => controller.completeBooking(req, res)
  );

  /**
   * @openapi
   * /bookings/{id}/no-show:
   *   post:
   *     summary: Mark a booking as no-show
   *     description: Mark a customer as no-show when they don't arrive. Requires STAFF or ADMIN role.
   *     tags:
   *       - Staff Operations
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Booking ID
   *     responses:
   *       200:
   *         description: Booking marked as no-show successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: string
   *                       format: uuid
   *                     status:
   *                       type: string
   *                       enum: [NO_SHOW]
   *                     previousStatus:
   *                       type: string
   *                       enum: [CONFIRMED, AUTHORIZED]
   *                     paymentMethod:
   *                       type: string
   *                       enum: [CASH, STRIPE]
   *       400:
   *         description: Bad request - invalid status (must be CONFIRMED or AUTHORIZED)
   *       404:
   *         description: Booking not found
   *       401:
   *         description: Unauthorized - authentication required
   *       403:
   *         description: Forbidden - insufficient permissions
   */
  router.post(
    '/:id/no-show',
    createRequireRole(UserRole.STAFF, UserRole.ADMIN),
    (req, res) => controller.noShowBooking(req, res)
  );

  router.get('/', (req, res) => controller.getBookings(req, res));

  /**
   * @openapi
   * /bookings/{id}:
   *   get:
   *     summary: Get booking by ID
   *     description: Returns full details of a specific booking including services. Users can only access their own bookings.
   *     tags:
   *       - Bookings
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Booking ID
   *     responses:
   *       200:
   *         description: Booking retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: string
   *                       format: uuid
   *                     services:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           id:
   *                             type: string
   *                             format: uuid
   *                           name:
   *                             type: string
   *                           price:
   *                             type: number
   *                           durationMinutes:
   *                             type: integer
   *                     appointmentDatetime:
   *                       type: string
   *                       format: date-time
   *                     appointmentDate:
   *                       type: string
   *                       format: date
   *                     appointmentTime:
   *                       type: string
   *                       example: "14:30"
   *                     status:
   *                       type: string
   *                       enum: [PENDING_PAYMENT, CONFIRMED, AUTHORIZED, CHECKED_IN, DONE, CANCELLED, NO_SHOW, PAYMENT_FAILED]
   *                     paymentMethod:
   *                       type: string
   *                       enum: [CASH, STRIPE]
   *                     totalPrice:
   *                       type: number
   *                     totalDurationMinutes:
   *                       type: integer
   *                     notes:
   *                       type: string
   *                       nullable: true
   *                     createdAt:
   *                       type: string
   *                       format: date-time
   *       401:
   *         description: Unauthorized - authentication required
   *       403:
   *         description: Forbidden - booking belongs to another user
   *       404:
   *         description: Booking not found
   */
  router.get('/:id', (req, res) => controller.getBookingById(req, res));

  router.post('/', (req, res) => controller.createBooking(req, res));

  /**
   * @openapi
   * /bookings/{id}/cancel:
   *   post:
   *     summary: Cancel a booking
   *     description: |
   *       Cancels a booking. Must be cancelled at least 15 minutes before the appointment.
   *       - For AUTHORIZED card payments: cancels the Stripe PaymentIntent (no charge).
   *       - For CONFIRMED card payments: issues a Stripe refund.
   *       - For cash payments: simply updates the status to CANCELLED.
   *     tags:
   *       - Bookings
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Booking ID
   *     responses:
   *       200:
   *         description: Booking cancelled successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: string
   *                       format: uuid
   *                     status:
   *                       type: string
   *                       enum: [CANCELLED]
   *                     paymentMethod:
   *                       type: string
   *                       enum: [CASH, STRIPE]
   *                     cancelledAt:
   *                       type: string
   *                       format: date-time
   *                     refundInitiated:
   *                       type: boolean
   *                       description: True if a Stripe refund or cancellation was triggered
   *                     refundAmount:
   *                       type: number
   *                       description: Refund amount in USD (only present when refundInitiated is true)
   *       400:
   *         description: Bad request - cannot cancel (wrong status or too close to appointment time)
   *       401:
   *         description: Unauthorized - authentication required
   *       403:
   *         description: Forbidden - booking belongs to another user
   *       404:
   *         description: Booking not found
   */
  router.post('/:id/cancel', (req, res) => controller.cancelBooking(req, res));

  return router;
}
