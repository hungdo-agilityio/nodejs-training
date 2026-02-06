import { clerkMiddleware } from '@clerk/express';

/**
 * Base Clerk middleware - initializes Clerk for all requests
 * Apply globally to the app before other routes
 */
export const clerkAuth = clerkMiddleware();
