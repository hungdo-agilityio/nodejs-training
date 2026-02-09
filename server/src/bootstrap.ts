import 'reflect-metadata';
import { Application } from 'express';
import { DataSource } from 'typeorm';
import { container, TOKENS } from '@shared/container';
import { AppDataSource } from '@shared/database';
import { createApp } from './app';
import { ConsoleLogger, ILogger } from '@shared/utils';
import { UserRepository, UserService, UserController } from '@modules/users';
import { SlotService, SlotController } from '@modules/slots';
import { Booking } from '@modules/bookings/entities/booking.entity';
import { Service } from '@modules/services/entities/service.entity';
import { ClerkWebhookHandler } from '@modules/auth';

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

  const bookingRepository = dataSource.getRepository(Booking);
  const serviceRepository = dataSource.getRepository(Service);

  // Services
  const userService = new UserService(userRepository, logger);
  container.registerValue(TOKENS.UserService, userService);

  const slotService = new SlotService(
    bookingRepository,
    serviceRepository,
    logger
  );
  container.registerValue(TOKENS.SlotService, slotService);

  // Controllers
  const userController = new UserController();
  container.registerValue(TOKENS.UserController, userController);

  const slotController = new SlotController(slotService);
  container.registerValue(TOKENS.SlotController, slotController);

  // Handlers
  const clerkWebhookHandler = new ClerkWebhookHandler(userService, logger);
  container.registerValue(TOKENS.ClerkWebhookHandler, clerkWebhookHandler);

  return { clerkWebhookHandler, userController, userService, slotController };
};

export const bootstrap = async (): Promise<BootstrapResult> => {
  const logger = new ConsoleLogger();

  logger.info('Initializing database connection...');
  await AppDataSource.initialize();
  await AppDataSource.runMigrations();
  logger.info('Migrations completed');

  const { clerkWebhookHandler, userController, userService, slotController } =
    registerDependencies(AppDataSource, logger);

  const app = createApp(
    { clerkWebhookHandler, userController, userService, slotController },
    logger
  );

  return { app, dataSource: AppDataSource, logger };
};

export const shutdown = async (): Promise<void> => {
  const dataSource = container.resolve<DataSource>(TOKENS.DataSource);
  await dataSource.destroy();
  container.clear();
};
