export type PaymentMethod = 'CASH' | 'STRIPE';

export interface CreateBookingRequest {
  serviceIds: string[];
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // HH:MM (24-hour format)
  paymentMethod: PaymentMethod;
  notes?: string;
}

export type BookingStatus =
  | 'PENDING_PAYMENT'
  | 'CONFIRMED'
  | 'AUTHORIZED'
  | 'CHECKED_IN'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'EXPIRED';

export interface Booking {
  id: string;
  userId: string;
  appointmentDate: string;
  appointmentDatetime: string;
  appointmentTime: string;
  totalPrice: number;
  totalDurationMinutes: number;
  status: BookingStatus;
  paymentMethod: PaymentMethod;
  idempotencyKey: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingResponse {
  data: Booking;
}
