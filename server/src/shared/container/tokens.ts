export const TOKENS = {
  // Infrastructure
  DataSource: 'DataSource',
  Logger: 'Logger',
  StripeClient: 'StripeClient',

  // Repositories
  UserRepository: 'UserRepository',
  SalonServiceRepository: 'SalonServiceRepository',
  BookingRepository: 'BookingRepository',

  // Services
  UserService: 'UserService',
  BookingService: 'BookingService',
  SalonServiceService: 'SalonServiceService',
  PaymentService: 'PaymentService',
  StaffService: 'StaffService',
  SlotService: 'SlotService',

  // Handlers
  ClerkWebhookHandler: 'ClerkWebhookHandler',
  WebhookController: 'WebhookController',

  // Controllers
  UserController: 'UserController',
  BookingController: 'BookingController',
  SalonServiceController: 'SalonServiceController',
  PaymentController: 'PaymentController',
  StaffController: 'StaffController',
  SlotController: 'SlotController',
} as const;
