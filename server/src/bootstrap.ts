import 'reflect-metadata';
import { Application } from 'express';
import { DataSource } from 'typeorm';
import { container, TOKENS, ServiceLifetime } from '@shared/container';
import { AppDataSource } from '@shared/database';
import { createApp } from './app';
import { ConsoleLogger, ILogger } from '@shared/utils';

export interface BootstrapResult {
  app: Application;
  dataSource: DataSource;
  logger: ILogger;
}

const registerDependencies = (
  dataSource: DataSource,
  logger: ILogger
): void => {
  // Register infrastructure (singletons)
  container.registerValue(TOKENS.DataSource, dataSource);
  container.registerValue(TOKENS.Logger, logger);

  // Services will be registered here as they're implemented
  // Example:
  // container.register(
  //   TOKENS.UserService,
  //   (c) => new UserService(c.resolve(TOKENS.DataSource), c.resolve(TOKENS.Logger)),
  //   ServiceLifetime.SCOPED
  // );

  // Controllers will be registered here as they're implemented
  // Example:
  // container.register(
  //   TOKENS.UserController,
  //   (c) => new UserController(c.resolve(TOKENS.UserService)),
  //   ServiceLifetime.SCOPED
  // );
};

export const bootstrap = async (): Promise<BootstrapResult> => {
  const logger = new ConsoleLogger();

  logger.info('Initializing database connection...');
  await AppDataSource.initialize();
  logger.info('Database connected successfully');

  logger.info('Running migrations...');
  await AppDataSource.runMigrations();
  logger.info('Migrations completed');

  registerDependencies(AppDataSource, logger);

  const app = createApp({}, logger);

  return { app, dataSource: AppDataSource, logger };
};

export const shutdown = async (): Promise<void> => {
  const dataSource = container.resolve<DataSource>(TOKENS.DataSource);
  await dataSource.destroy();
  container.clear();
};
