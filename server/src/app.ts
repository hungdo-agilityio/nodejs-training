import express, { Application } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { getAuth } from '@clerk/express';
import { ILogger } from '@shared/types';
import {
  clerkAuth,
  errorHandler,
  requireAuthentication,
} from '@shared/middleware';
import { NODE_ENV } from '@shared/constants';
import { swaggerSpec } from '@shared/swagger';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AppDependencies {
  // Controllers will be added here as they're implemented
}

export const createApp = (
  dependencies: AppDependencies,
  logger: ILogger
): Application => {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(clerkAuth);

  // Swagger documentation (non-production only)
  if (NODE_ENV !== 'production') {
    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  }

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
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  /**
   * @openapi
   * /me:
   *   get:
   *     summary: Get current user profile
   *     description: Returns the authenticated user's profile information
   *     tags:
   *       - Auth
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: User profile retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: object
   *                   properties:
   *                     userId:
   *                       type: string
   *                     sessionId:
   *                       type: string
   *       401:
   *         description: Unauthorized
   */
  app.get('/api/me', requireAuthentication, (req, res) => {
    const auth = getAuth(req);
    res.json({
      data: {
        userId: auth.userId,
        sessionId: auth.sessionId,
      },
    });
  });

  // API Routes will be registered here
  // app.use('/api/users', userRoutes(dependencies.userController));
  // app.use('/api/bookings', bookingRoutes(dependencies.bookingController));
  // etc...

  // Error handling
  app.use(errorHandler(logger));

  return app;
};
