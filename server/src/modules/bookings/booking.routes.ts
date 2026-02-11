import { Router } from 'express';
import { IBookingController } from './booking.controller.interface';

export function createBookingRoutes(controller: IBookingController): Router {
  const router = Router();

  /**
   * @openapi
   * /bookings:
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
  router.post('/', (req, res) => controller.createBooking(req, res));

  return router;
}
