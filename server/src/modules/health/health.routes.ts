import { Router } from 'express';

export const createHealthRoutes = (): Router => {
  const router = Router();

  /**
   * @openapi
   * /health:
   *   get:
   *     summary: Health check endpoint
   *     description: Returns the health status of the API
   *     tags:
   *       - Health
   *     responses:
   *       200:
   *         description: API is healthy
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: ok
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   *                   example: 2024-01-01T00:00:00.000Z
   */
  router.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  return router;
};
