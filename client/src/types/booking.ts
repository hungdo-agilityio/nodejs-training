export type PaymentMethod = 'CASH' | 'STRIPE';

export interface CreateBookingRequest {
  serviceIds: string[];
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // HH:MM (24-hour format)
  paymentMethod: PaymentMethod;
  notes?: string;
  stripePaymentIntentId?: string;
}

export type BookingStatus =
  | 'PENDING_PAYMENT'
  | 'CONFIRMED'
  | 'AUTHORIZED'
  | 'CHECKED_IN'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'EXPIRED';

export interface BookingService {
  id?: string;
  name: string;
  price: number;
  durationMinutes: number;
}

export interface Booking {
  id: string;
  servicesCount: number;
  appointmentDatetime: string;
  appointmentDate: string;
  appointmentTime: string;
  status: BookingStatus;
  paymentMethod: PaymentMethod;
  totalPrice: number;
  totalDurationMinutes: number;
  idempotencyKey: string;
  createdAt: string;
}

export interface CreateBookingResponse {
  data: Booking;
}

export interface GetBookingsResponse {
  data: Booking[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface GetBookingsParams {
  status?: BookingStatus;
  paymentMethod?: PaymentMethod;
  serviceId?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: 'upcoming' | 'recent' | 'past';
  page?: number;
  limit?: number;
}

export interface BookingDetail {
  id: string;
  services: BookingService[];
  appointmentDatetime: string;
  appointmentDate: string;
  appointmentTime: string;
  status: BookingStatus;
  paymentMethod: PaymentMethod;
  totalPrice: number;
  totalDurationMinutes: number;
  notes: string | null;
  createdAt: string;
}
