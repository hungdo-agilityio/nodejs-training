import { defineConfig } from 'vitest/config';
import path from 'path';
import { config as loadDotenv } from 'dotenv';

// Load .env.test so Clerk/Stripe keys are available in the worker env.
// Falls back gracefully when the file doesn't exist (CI, fresh clone, etc.)
loadDotenv({ path: path.resolve(__dirname, '.env.test') });

export default defineConfig({
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, 'src/shared'),
      '@modules': path.resolve(__dirname, 'src/modules'),
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    globals: true,
    include: ['test/e2e/**/*.e2e-spec.ts'],
    setupFiles: ['./test/e2e/setup/global.ts'],
    // Share module instances across test files so AppDataSource is a true singleton
    isolate: false,
    pool: 'forks',
    testTimeout: 30_000,
    hookTimeout: 30_000,
    env: {
      NODE_ENV: 'test',
      // Use in-memory SQLite — every test run starts with a clean schema
      DATABASE_PATH: ':memory:',
      // Forward keys loaded from .env.test into the worker process
      CLERK_PUBLISHABLE_KEY: process.env.CLERK_PUBLISHABLE_KEY ?? '',
      CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY ?? '',
      CLERK_WEBHOOK_SIGNING_SECRET:
        process.env.CLERK_WEBHOOK_SIGNING_SECRET ?? '',
      CLERK_TEST_SESSION_TOKEN: process.env.CLERK_TEST_SESSION_TOKEN ?? '',
      CLERK_TEST_USER_ID: process.env.CLERK_TEST_USER_ID ?? '',
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ?? '',
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ?? '',
    },
  },
});
