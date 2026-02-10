import { Router } from 'express';
import { IServiceController } from './service.controller.interface';

export const createServiceRoutes = (
  serviceController: IServiceController
): Router => {
  const router = Router();

  /**
   * @openapi
   * /services:
   *   get:
   *     summary: Get all active services
   *     description: Returns a list of all active services available for booking
   *     tags:
   *       - Services
   *     responses:
   *       200:
   *         description: Services retrieved successfully
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
   *                       name:
   *                         type: string
   *                       description:
   *                         type: string
   *                         nullable: true
   *                       price:
   *                         type: number
   *                         format: decimal
   *                       durationMinutes:
   *                         type: integer
   *                       isActive:
   *                         type: boolean
   *                       createdAt:
   *                         type: string
   *                         format: date-time
   *                       updatedAt:
   *                         type: string
   *                         format: date-time
   *       500:
   *         description: Internal server error
   */
  router.get('/services', (req, res) => serviceController.getServices(req, res));

  return router;
};
