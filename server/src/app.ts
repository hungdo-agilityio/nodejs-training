import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { ILogger } from '@shared/types';
import {
  clerkAuth,
  createErrorHandler,
  createLoadUser,
} from '@shared/middleware';
import { swaggerSpec } from '@shared/swagger';
import { IClerkWebhookHandler, createClerkWebhookRoutes } from '@modules/auth';
import { IUserController, IUserService } from '@modules/users';
import { ISlotController } from '@modules/slots';
import { ISalonServiceController } from '@modules/salon-services';
import { IBookingController } from '@modules/bookings';
import {
  IPaymentController,
  IWebhookController,
  createStripeWebhookRoutes,
} from '@modules/payments';
import { createApiRouter } from './routes';

export interface AppDependencies {
  clerkWebhookHandler: IClerkWebhookHandler;
  userController: IUserController;
  userService: IUserService;
  slotController: ISlotController;
  salonServiceController: ISalonServiceController;
  bookingController: IBookingController;
  paymentController: IPaymentController;
  webhookController: IWebhookController;
}

export const createApp = (
  dependencies: AppDependencies,
  logger: ILogger
): Application => {
  const app = express();

  // Middleware
  app.use(helmet());
  app.use(cors());

  // Webhook routes (need raw body, must come before express.json())
  app.use('/api/webhooks/clerk', createClerkWebhookRoutes(dependencies));
  app.use(
    '/api/webhooks/stripe',
    createStripeWebhookRoutes(dependencies.webhookController)
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(clerkAuth);

  // Swagger documentation
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // API Routes
  app.use(
    '/api',
    createApiRouter(dependencies, createLoadUser(dependencies.userService))
  );

  // Error handling
  app.use(createErrorHandler(logger));

  return app;
};
