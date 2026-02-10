export const TOKENS = {
  // Infrastructure
  DataSource: 'DataSource',
  Logger: 'Logger',
  StripeClient: 'StripeClient',

  // Repositories
  UserRepository: 'UserRepository',
  ServiceRepository: 'ServiceRepository',

  // Services
  UserService: 'UserService',
  BookingService: 'BookingService',
  ServiceService: 'ServiceService',
  PaymentService: 'PaymentService',
  StaffService: 'StaffService',
  SlotService: 'SlotService',

  // Handlers
  ClerkWebhookHandler: 'ClerkWebhookHandler',

  // Controllers
  UserController: 'UserController',
  BookingController: 'BookingController',
  ServiceController: 'ServiceController',
  PaymentController: 'PaymentController',
  StaffController: 'StaffController',
  SlotController: 'SlotController',
} as const;
