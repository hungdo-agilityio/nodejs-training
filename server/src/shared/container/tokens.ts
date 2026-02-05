export const TOKENS = {
  // Infrastructure
  DataSource: 'DataSource',
  Logger: 'Logger',
  StripeClient: 'StripeClient',

  // Services
  UserService: 'UserService',
  BookingService: 'BookingService',
  ServiceService: 'ServiceService',
  PaymentService: 'PaymentService',
  StaffService: 'StaffService',

  // Controllers
  UserController: 'UserController',
  BookingController: 'BookingController',
  ServiceController: 'ServiceController',
  PaymentController: 'PaymentController',
  StaffController: 'StaffController',
} as const;
