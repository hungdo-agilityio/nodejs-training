/**
 * E2E global setup — runs before every test file in its worker fork.
 *
 * WHY import.meta.glob FOR ENTITIES?
 * TypeORM's AppDataSource uses glob strings like 'src/modules/** /entities/*.ts'
 * which it resolves via Node's native require(). Under vite-node (vitest's engine)
 * raw .ts files cannot be loaded that way — decorators are stripped and TypeScript
 * syntax causes "SyntaxError: Invalid or unexpected token".
 *
 * import.meta.glob is Vite's native glob import — every matched file goes through
 * vite-node's TypeScript transform, so decorators and types work correctly.
 * Entities are discovered automatically, so adding a new entity file requires no
 * changes here.
 *
 * WHY synchronize: true INSTEAD OF runMigrations()?
 * TypeORM runs migrations from .ts files the same way — native require(), same
 * crash. Using synchronize:true lets TypeORM build the schema directly from the
 * entity metadata already in memory, with no file loading at all. We skip
 * migration correctness here because E2E tests focus on API behaviour, not schema
 * history. Migrations are exercised by the real app on a real database.
 */
import 'reflect-metadata';
import { beforeAll } from 'vitest';
import supertest from 'supertest';
import type { Application } from 'express';
import type { EntitySchema, MixedList } from 'typeorm';
import { PaymentService } from '../../../src/modules/payments';

// ── Auto-discover every entity through vite-node's transform pipeline ─────────
// When a new entity file is added under src/modules/**/entities/, it is picked
// up here automatically — no manual list to maintain.
// @ts-expect-error - glob imports are typed as Record<string, unknown>
const entityModules = import.meta.glob(
  '../../../src/modules/**/entities/*.ts',
  { eager: true }
);

const entities = Object.values(entityModules).flatMap((mod) =>
  Object.values(mod as Record<string, unknown>).filter(
    (v): v is EntitySchema => typeof v === 'function'
  )
) as MixedList<EntitySchema>;

// ─────────────────────────────────────────────────────────────────────────────

let app: Application | null = null;

export const getApp = (): Application => {
  if (!app) throw new Error('App not initialized — check E2E setup.');
  return app;
};

export const getRequest = () => supertest(getApp());

beforeAll(async () => {
  const { AppDataSource } = await import('../../../src/shared/database');
  const { createApp } = await import('../../../src/app');
  const { ConsoleLogger } = await import('../../../src/shared/utils');
  const { UserRepository, UserService, UserController } =
    await import('../../../src/modules/users');
  const { SlotService, SlotController } =
    await import('../../../src/modules/slots');
  const {
    SalonServiceRepository,
    SalonServiceService,
    SalonServiceController,
  } = await import('../../../src/modules/salon-services');
  const { BookingBusinessService, BookingController, BookingRepository } =
    await import('../../../src/modules/bookings');
  const { ClerkWebhookHandler } = await import('../../../src/modules/auth');
  const { PaymentController, WebhookController } =
    await import('../../../src/modules/payments');
  const Stripe = (await import('stripe')).default;
  const { STRIPE_SECRET_KEY } = await import('../../../src/shared/constants');
  const { seedTestData } = await import('./seed');

  // ── Patch DataSource: swap glob strings for vite-resolved class references ──
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dsOpts = (AppDataSource as any).options;
  dsOpts.entities = entities;
  dsOpts.migrations = []; // not needed — synchronize:true recreates schema
  dsOpts.synchronize = false;
  dsOpts.dropSchema = false;

  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
    await AppDataSource.query('DROP SCHEMA public CASCADE');
    await AppDataSource.query('CREATE SCHEMA public');
    await AppDataSource.synchronize();
    await seedTestData(AppDataSource);
  }

  // ── Wire dependencies (mirrors bootstrap.ts) ───────────────────────────────
  const logger = new ConsoleLogger();

  const userRepository = new UserRepository();
  const salonServiceRepository = new SalonServiceRepository();
  const bookingRepository = new BookingRepository(AppDataSource);

  const userService = new UserService(userRepository, logger);
  const salonServiceService = new SalonServiceService(
    salonServiceRepository,
    logger
  );
  const slotService = new SlotService(
    bookingRepository,
    salonServiceRepository,
    logger
  );

  const stripeKey = STRIPE_SECRET_KEY || 'sk_test_placeholder_for_e2e_tests';
  const stripe = new Stripe(stripeKey, {
    apiVersion: '2026-01-28.clover',
  });
  const stripeService = new PaymentService(stripe, logger);

  const bookingBusinessService = new BookingBusinessService(
    bookingRepository,
    salonServiceRepository,
    stripeService,
    logger
  );

  const userController = new UserController();
  const salonServiceController = new SalonServiceController(
    salonServiceService
  );
  const slotController = new SlotController(slotService);
  const bookingController = new BookingController(
    bookingBusinessService,
    stripeService,
    logger
  );
  const paymentController = new PaymentController(
    stripeService,
    bookingBusinessService,
    logger
  );
  const webhookController = new WebhookController(
    stripeService,
    bookingBusinessService,
    logger
  );
  const clerkWebhookHandler = new ClerkWebhookHandler(userService, logger);

  app = createApp(
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
});
