import express, { Application } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { ILogger } from '@shared/types';
import { clerkAuth, createErrorHandler, createLoadUser } from '@shared/middleware';
import { NODE_ENV } from '@shared/constants';
import { swaggerSpec } from '@shared/swagger';
import { IClerkWebhookHandler, createAuthRoutes } from '@modules/auth';
import { IUserController, IUserService, createUserRoutes } from '@modules/users';
import { ISlotController, createSlotRoutes } from '@modules/slots';
import { createHealthRoutes } from '@modules/health';

export interface AppDependencies {
  clerkWebhookHandler: IClerkWebhookHandler;
  userController: IUserController;
  userService: IUserService;
  slotController: ISlotController;
}

export const createApp = (
  dependencies: AppDependencies,
  logger: ILogger
): Application => {
  const app = express();

  // Middleware
  app.use(cors());

  // Auth routes (webhooks need raw body, must come before express.json())
  app.use('/api', createAuthRoutes(dependencies));

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(clerkAuth);

  // Load authenticated user from database
  const loadUser = createLoadUser(dependencies.userService);

  // Swagger documentation (non-production only)
  if (NODE_ENV !== 'production') {
    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  }

  // API Routes
  app.use('/api', createHealthRoutes());
  app.use('/api', createSlotRoutes(dependencies.slotController)); // Public route
  app.use('/api', loadUser, createUserRoutes(dependencies.userController));

  // Error handling
  app.use(createErrorHandler(logger));

  return app;
};
