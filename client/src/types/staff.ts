import { BookingStatus, PaymentMethod } from './booking';

export interface StaffDailyBooking {
  id: string;
  services: Array<{
    name: string;
    durationMinutes: number;
  }>;
  appointmentTime: string;
  endsAt: string;
  customer: {
    name: string;
    email: string;
  };
  status: BookingStatus;
  paymentMethod: PaymentMethod;
  totalPrice: number;
  totalDurationMinutes: number;
}

export interface StaffDailyResponse {
  date: string;
  dayName: string;
  bookings: StaffDailyBooking[];
  summary: {
    total: number;
    totalRevenue: number;
    byStatus: Record<string, number>;
    byPaymentMethod: Record<string, number>;
  };
}

export interface CheckInResponse {
  id: string;
  status: BookingStatus;
  checkedInAt: string;
  payment?: {
    provider: string;
    providerPaymentId: string;
    status: string;
    amount: number;
    capturedAt: string;
  };
}

export interface CompleteResponse {
  id: string;
  status: BookingStatus;
  completedAt: string;
}

export interface NoShowResponse {
  id: string;
  status: BookingStatus;
  paymentMethod: PaymentMethod;
}
