import express, { Application } from 'express';
import cors from 'cors';
import { ILogger } from '@shared/types';
import { errorHandler } from '@shared/middleware';

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

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API Routes will be registered here
  // app.use('/api/users', userRoutes(dependencies.userController));
  // app.use('/api/bookings', bookingRoutes(dependencies.bookingController));
  // etc...

  // Error handling
  app.use(errorHandler(logger));

  return app;
};
