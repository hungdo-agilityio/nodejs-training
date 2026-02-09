import { Router } from 'express';
import { ISlotController } from './slot.controller.interface';

export const createSlotRoutes = (slotController: ISlotController): Router => {
  const router = Router();

  /**
   * @openapi
   * /slots:
   *   get:
   *     summary: Get available time slots
   *     description: Dynamically generates available time slots based on business hours and checks real-time capacity
   *     tags:
   *       - Slots
   *     parameters:
   *       - in: query
   *         name: date
   *         required: true
   *         schema:
   *           type: string
   *           format: date
   *           example: "2026-02-17"
   *         description: Date to check availability (YYYY-MM-DD)
   *       - in: query
   *         name: service_ids
   *         required: false
   *         schema:
   *           type: string
   *           example: "service_001,service_002"
   *         description: Comma-separated list of service UUIDs to filter slots that fit total duration
   *     responses:
   *       200:
   *         description: Available slots retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: object
   *                   properties:
   *                     date:
   *                       type: string
   *                       example: "2026-02-17"
   *                     dayOfWeek:
   *                       type: number
   *                       example: 1
   *                     dayName:
   *                       type: string
   *                       example: "Monday"
   *                     businessHours:
   *                       type: object
   *                       properties:
   *                         openTime:
   *                           type: string
   *                           example: "09:00"
   *                         closeTime:
   *                           type: string
   *                           example: "18:00"
   *                         lunchBreak:
   *                           type: object
   *                           properties:
   *                             start:
   *                               type: string
   *                               example: "12:00"
   *                             end:
   *                               type: string
   *                               example: "13:00"
   *                         capacity:
   *                           type: number
   *                           example: 2
   *                         slotInterval:
   *                           type: number
   *                           example: 30
   *                     requiredDuration:
   *                       type: number
   *                       example: 150
   *                     slots:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           startTime:
   *                             type: string
   *                             example: "09:00"
   *                           endsAt:
   *                             type: string
   *                             example: "11:30"
   *                           capacity:
   *                             type: number
   *                             example: 2
   *                           occupied:
   *                             type: number
   *                             example: 0
   *                           available:
   *                             type: boolean
   *                             example: true
   *       400:
   *         description: Invalid request parameters
   *       404:
   *         description: No availability or salon closed
   */
  router.get('/slots', (req, res) => slotController.getAvailableSlots(req, res));

  return router;
};
