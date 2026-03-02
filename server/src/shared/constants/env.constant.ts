export const NODE_ENV = process.env.NODE_ENV || 'development';
export const PORT = parseInt(process.env.PORT || '3000', 10);

// Database (SQLite)
export const DATABASE_PATH =
  process.env.DATABASE_PATH || './data/salon_booking.db';

// Clerk
export const CLERK_PUBLISHABLE_KEY = process.env.CLERK_PUBLISHABLE_KEY || '';
export const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY || '';

// Stripe
export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';
