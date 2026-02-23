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
  ServiceRepository,
  ServiceService,
  ServiceController,
} from '@modules/services';
import { BookingBusinessService, BookingController } from '@modules/bookings';
import { Booking } from '@modules/bookings/entities/booking.entity';
import { BookingService as BookingServiceEntity } from '@modules/bookings/entities/booking-service.entity';
import { Service } from '@modules/services/entities/service.entity';
import { ClerkWebhookHandler } from '@modules/auth';
import {
  StripeService,
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
  serviceController: ServiceController;
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

  const serviceRepository = new ServiceRepository();
  container.registerValue(TOKENS.ServiceRepository, serviceRepository);

  const bookingRepository = dataSource.getRepository(Booking);
  const bookingServiceRepository =
    dataSource.getRepository(BookingServiceEntity);
  const serviceEntityRepository = dataSource.getRepository(Service);

  // Services
  const userService = new UserService(userRepository, logger);
  container.registerValue(TOKENS.UserService, userService);

  const serviceService = new ServiceService(serviceRepository, logger);
  container.registerValue(TOKENS.ServiceService, serviceService);

  const slotService = new SlotService(
    bookingRepository,
    serviceEntityRepository,
    logger
  );
  container.registerValue(TOKENS.SlotService, slotService);

  const bookingBusinessService = new BookingBusinessService(
    bookingRepository,
    bookingServiceRepository,
    serviceEntityRepository,
    logger
  );
  container.registerValue(TOKENS.BookingService, bookingBusinessService);

  // Stripe
  const stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: '2026-01-28.clover',
  });
  const stripeService = new StripeService(stripe, logger);
  container.registerValue(TOKENS.StripeService, stripeService);

  // Controllers
  const userController = new UserController();
  container.registerValue(TOKENS.UserController, userController);

  const serviceController = new ServiceController(serviceService);
  container.registerValue(TOKENS.ServiceController, serviceController);

  const slotController = new SlotController(slotService);
  container.registerValue(TOKENS.SlotController, slotController);

  const bookingController = new BookingController(
    bookingBusinessService,
    stripeService
  );
  container.registerValue(TOKENS.BookingController, bookingController);

  const paymentController = new PaymentController(
    stripeService,
    bookingBusinessService
  );
  container.registerValue(TOKENS.PaymentController, paymentController);

  const webhookController = new WebhookController(
    stripeService,
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
    serviceController,
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
    serviceController,
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
      serviceController,
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
