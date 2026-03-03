import 'reflect-metadata';
import { Application } from 'express';
import { DataSource } from 'typeorm';
import { container, TOKENS } from '@shared/container';
import { AppDataSource } from '@shared/database';
import { createApp } from './app';
import { ConsoleLogger, ILogger } from '@shared/utils';
import { UserRepository, UserService, UserController } from '@modules/users';
import { SlotService, SlotController } from '@modules/slots';
import {
  SalonServiceRepository,
  SalonServiceService,
  SalonServiceController,
} from '@modules/salon-services';
import {
  BookingBusinessService,
  BookingController,
  BookingRepository,
} from '@modules/bookings';
import { ClerkWebhookHandler } from '@modules/auth';
import {
  PaymentService,
  PaymentController,
  WebhookController,
} from '@modules/payments';
import Stripe from 'stripe';
import { STRIPE_SECRET_KEY } from '@shared/constants';

export interface BootstrapResult {
  app: Application;
  dataSource: DataSource;
  logger: ILogger;
}

interface RegisteredDependencies {
  clerkWebhookHandler: ClerkWebhookHandler;
  userController: UserController;
  userService: UserService;
  slotController: SlotController;
  salonServiceController: SalonServiceController;
  bookingController: BookingController;
  paymentController: PaymentController;
  webhookController: WebhookController;
}

const registerDependencies = (
  dataSource: DataSource,
  logger: ILogger
): RegisteredDependencies => {
  // Register infrastructure (singletons)
  container.registerValue(TOKENS.DataSource, dataSource);
  container.registerValue(TOKENS.Logger, logger);

  // Repositories
  const userRepository = new UserRepository();
  container.registerValue(TOKENS.UserRepository, userRepository);

  const salonServiceRepository = new SalonServiceRepository();
  container.registerValue(
    TOKENS.SalonServiceRepository,
    salonServiceRepository
  );

  const bookingRepository = new BookingRepository(dataSource);
  container.registerValue(TOKENS.BookingRepository, bookingRepository);

  // Services
  const userService = new UserService(userRepository, logger);
  container.registerValue(TOKENS.UserService, userService);

  const salonServiceService = new SalonServiceService(
    salonServiceRepository,
    logger
  );
  container.registerValue(TOKENS.SalonServiceService, salonServiceService);

  const slotService = new SlotService(
    bookingRepository,
    salonServiceRepository,
    logger
  );
  container.registerValue(TOKENS.SlotService, slotService);

  // Stripe
  const stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: '2026-01-28.clover',
  });
  const paymentService = new PaymentService(stripe, logger);
  container.registerValue(TOKENS.PaymentService, paymentService);

  const bookingBusinessService = new BookingBusinessService(
    bookingRepository,
    salonServiceRepository,
    paymentService,
    logger
  );
  container.registerValue(TOKENS.BookingService, bookingBusinessService);

  // Controllers
  const userController = new UserController();
  container.registerValue(TOKENS.UserController, userController);

  const salonServiceController = new SalonServiceController(
    salonServiceService
  );
  container.registerValue(
    TOKENS.SalonServiceController,
    salonServiceController
  );

  const slotController = new SlotController(slotService);
  container.registerValue(TOKENS.SlotController, slotController);

  const bookingController = new BookingController(
    bookingBusinessService,
    paymentService,
    logger
  );
  container.registerValue(TOKENS.BookingController, bookingController);

  const paymentController = new PaymentController(
    paymentService,
    bookingBusinessService,
    logger
  );
  container.registerValue(TOKENS.PaymentController, paymentController);

  const webhookController = new WebhookController(
    paymentService,
    bookingBusinessService,
    logger
  );
  container.registerValue(TOKENS.WebhookController, webhookController);

  // Handlers
  const clerkWebhookHandler = new ClerkWebhookHandler(userService, logger);
  container.registerValue(TOKENS.ClerkWebhookHandler, clerkWebhookHandler);

  return {
    clerkWebhookHandler,
    userController,
    userService,
    slotController,
    salonServiceController,
    bookingController,
    paymentController,
    webhookController,
  };
};

export const bootstrap = async (): Promise<BootstrapResult> => {
  const logger = new ConsoleLogger();

  logger.info('Initializing database connection...');
  await AppDataSource.initialize();
  await AppDataSource.runMigrations();
  logger.info('Migrations completed');

  const {
    clerkWebhookHandler,
    userController,
    userService,
    slotController,
    salonServiceController,
    bookingController,
    paymentController,
    webhookController,
  } = registerDependencies(AppDataSource, logger);

  const app = createApp(
    {
      clerkWebhookHandler,
      userController,
      userService,
      slotController,
      salonServiceController,
      bookingController,
      paymentController,
      webhookController,
    },
    logger
  );

  return { app, dataSource: AppDataSource, logger };
};

export const shutdown = async (): Promise<void> => {
  const dataSource = container.resolve<DataSource>(TOKENS.DataSource);
  await dataSource.destroy();
  container.clear();
};
