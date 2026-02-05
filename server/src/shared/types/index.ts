// Common types
export interface ILogger {
  log(message: string): void;
  error(message: string, error?: Error): void;
  warn(message: string): void;
  info(message: string): void;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    total_pages?: number;
  };
}

export enum UserRole {
  USER = 'USER',
  STAFF = 'STAFF',
  ADMIN = 'ADMIN',
}

export enum BookingStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  AUTHORIZED = 'AUTHORIZED',
  CONFIRMED = 'CONFIRMED',
  CHECKED_IN = 'CHECKED_IN',
  DONE = 'DONE',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
}

export enum PaymentMethod {
  CARD = 'card',
  CASH = 'cash',
}
