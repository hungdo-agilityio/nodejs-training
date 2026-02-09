export const TOKENS = {
  // Infrastructure
  DataSource: 'DataSource',
  Logger: 'Logger',
  StripeClient: 'StripeClient',

  // Repositories
  UserRepository: 'UserRepository',

  // Services
  UserService: 'UserService',
  BookingService: 'BookingService',
  ServiceService: 'ServiceService',
  PaymentService: 'PaymentService',
  StaffService: 'StaffService',

  // Handlers
  ClerkWebhookHandler: 'ClerkWebhookHandler',

  // Controllers
  UserController: 'UserController',
  BookingController: 'BookingController',
  ServiceController: 'ServiceController',
  PaymentController: 'PaymentController',
  StaffController: 'StaffController',
} as const;
