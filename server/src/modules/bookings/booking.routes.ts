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
   *           enum: [PENDING_PAYMENT, CONFIRMED, AUTHORIZED, CHECKED_IN, COMPLETED, CANCELLED, EXPIRED]
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
   *                       services:
   *                         type: array
   *                         items:
   *                           type: object
   *                           properties:
   *                             name:
   *                               type: string
   *                             price:
   *                               type: number
   *                             durationMinutes:
   *                               type: integer
   *                       appointmentDatetime:
   *                         type: string
   *                         format: date-time
   *                       appointmentDate:
   *                         type: string
   *                         format: date
   *                       appointmentTime:
   *                         type: string
   *                       status:
   *                         type: string
   *                       paymentMethod:
   *                         type: string
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
   *     description: Creates a new booking with the selected services and appointment time. Includes concurrency protection via idempotency key.
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
   *                 description: Array of service IDs to book
   *                 example: ["service-uuid-1", "service-uuid-2"]
   *               appointmentDate:
   *                 type: string
   *                 format: date
   *                 description: Appointment date in YYYY-MM-DD format
   *                 example: "2026-02-15"
   *               appointmentTime:
   *                 type: string
   *                 pattern: '^([01][0-9]|2[0-3]):[0-5][0-9]$'
   *                 description: Appointment time in HH:MM format (24-hour)
   *                 example: "14:30"
   *               paymentMethod:
   *                 type: string
   *                 enum: [CASH, STRIPE]
   *                 description: Payment method for the booking
   *                 example: "STRIPE"
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
   *                     totalPrice:
   *                       type: number
   *                       format: decimal
   *                     totalDurationMinutes:
   *                       type: integer
   *                     status:
   *                       type: string
   *                       enum: [PENDING_PAYMENT, CONFIRMED, AUTHORIZED, CHECKED_IN, COMPLETED, CANCELLED, EXPIRED]
   *                       description: CONFIRMED for cash payments, PENDING_PAYMENT for card payments
   *                     idempotencyKey:
   *                       type: string
   *                       description: Unique key to prevent duplicate bookings
   *       400:
   *         description: Bad request - validation error or business rule violation
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   examples:
   *                     - "serviceIds is required and must be a non-empty array"
   *                     - "One or more services not found or inactive"
   *                     - "No capacity available for the requested time slot"
   *                     - "Booking already exists"
   *       401:
   *         description: Unauthorized - authentication required
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
   *                         enum: [PENDING_PAYMENT, CONFIRMED, AUTHORIZED, CHECKED_IN, DONE, CANCELLED, NO_SHOW, EXPIRED]
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

  router.get('/', (req, res) => controller.getBookings(req, res));
  router.get('/:id', (req, res) => controller.getBookingById(req, res));
  router.post('/', (req, res) => controller.createBooking(req, res));
  router.post('/:id/cancel', (req, res) => controller.cancelBooking(req, res));

  return router;
}
