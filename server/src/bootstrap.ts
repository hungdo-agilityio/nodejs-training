import 'reflect-metadata';
import { Application } from 'express';
import { DataSource } from 'typeorm';
import { container, TOKENS } from '@shared/container';
import { AppDataSource } from '@shared/database';
import { createApp } from './app';
import { ConsoleLogger, ILogger } from '@shared/utils';
import { UserRepository, UserService, UserController } from '@modules/users';
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

  // Services
  const userService = new UserService(userRepository, logger);
  container.registerValue(TOKENS.UserService, userService);

  // Controllers
  const userController = new UserController();
  container.registerValue(TOKENS.UserController, userController);

  // Handlers
  const clerkWebhookHandler = new ClerkWebhookHandler(userService, logger);
  container.registerValue(TOKENS.ClerkWebhookHandler, clerkWebhookHandler);

  return { clerkWebhookHandler, userController, userService };
};

export const bootstrap = async (): Promise<BootstrapResult> => {
  const logger = new ConsoleLogger();

  logger.info('Initializing database connection...');
  await AppDataSource.initialize();
  await AppDataSource.runMigrations();
  logger.info('Migrations completed');

  const { clerkWebhookHandler, userController, userService } =
    registerDependencies(AppDataSource, logger);

  const app = createApp(
    { clerkWebhookHandler, userController, userService },
    logger
  );

  return { app, dataSource: AppDataSource, logger };
};

export const shutdown = async (): Promise<void> => {
  const dataSource = container.resolve<DataSource>(TOKENS.DataSource);
  await dataSource.destroy();
  container.clear();
};
