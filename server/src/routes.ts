import { Router, RequestHandler } from 'express';
import { AppDependencies } from './app';
import { createHealthRoutes } from '@modules/health';
import { createSalonServiceRoutes } from '@modules/salon-services';
import { createSlotRoutes } from '@modules/slots';
import { createUserRoutes } from '@modules/users';
import { createBookingRoutes } from '@modules/bookings';
import { createPaymentRoutes } from '@modules/payments';

export const createApiRouter = (
  dependencies: AppDependencies,
  loadUser: RequestHandler
): Router => {
  const router = Router();

  // Public routes
  router.use('/health', createHealthRoutes());
  router.use('/services', createSalonServiceRoutes(dependencies.salonServiceController));
  router.use('/slots', createSlotRoutes(dependencies.slotController));

  // Authenticated routes
  router.use('/users', loadUser, createUserRoutes(dependencies.userController));
  router.use('/bookings', loadUser, createBookingRoutes(dependencies.bookingController));
  router.use('/payments', loadUser, createPaymentRoutes(dependencies.paymentController));

  return router;
};
