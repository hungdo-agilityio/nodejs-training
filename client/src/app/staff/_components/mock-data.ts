import { StaffDailyBooking } from '@/types/staff';

export const MOCK_BOOKINGS: StaffDailyBooking[] = [
  {
    id: 'mock-1',
    services: [
      { name: 'Haircut', durationMinutes: 60 },
      { name: 'Hair Coloring', durationMinutes: 90 },
    ],
    appointmentTime: '09:30',
    endsAt: '12:00',
    customer: { name: 'John Doe', email: 'john.doe@example.com' },
    status: 'CONFIRMED',
    paymentMethod: 'CASH',
    totalPrice: 145.0,
    totalDurationMinutes: 150,
  },
  {
    id: 'mock-2',
    services: [{ name: 'Manicure', durationMinutes: 30 }],
    appointmentTime: '10:00',
    endsAt: '10:30',
    customer: { name: 'Jane Smith', email: 'jane.smith@example.com' },
    status: 'AUTHORIZED',
    paymentMethod: 'STRIPE',
    totalPrice: 30.0,
    totalDurationMinutes: 30,
  },
  {
    id: 'mock-3',
    services: [{ name: 'Haircut', durationMinutes: 60 }],
    appointmentTime: '10:30',
    endsAt: '11:30',
    customer: { name: 'Bob Johnson', email: 'bob.johnson@example.com' },
    status: 'CHECKED_IN',
    paymentMethod: 'CASH',
    totalPrice: 55.0,
    totalDurationMinutes: 60,
  },
  {
    id: 'mock-4',
    services: [
      { name: 'Manicure', durationMinutes: 30 },
      { name: 'Haircut', durationMinutes: 60 },
    ],
    appointmentTime: '14:00',
    endsAt: '15:30',
    customer: { name: 'Alice Williams', email: 'alice.w@example.com' },
    status: 'DONE',
    paymentMethod: 'STRIPE',
    totalPrice: 85.0,
    totalDurationMinutes: 90,
  },
  {
    id: 'mock-5',
    services: [{ name: 'Hair Coloring', durationMinutes: 90 }],
    appointmentTime: '15:00',
    endsAt: '16:30',
    customer: { name: 'Charlie Brown', email: 'charlie.b@example.com' },
    status: 'NO_SHOW',
    paymentMethod: 'CASH',
    totalPrice: 80.0,
    totalDurationMinutes: 90,
  },
];

export function getMockSummary(bookings: StaffDailyBooking[]) {
  const byStatus: Record<string, number> = {};
  const byPaymentMethod: Record<string, number> = {};
  for (const b of bookings) {
    byStatus[b.status] = (byStatus[b.status] ?? 0) + 1;
    byPaymentMethod[b.paymentMethod] =
      (byPaymentMethod[b.paymentMethod] ?? 0) + 1;
  }
  return { total: bookings.length, byStatus, byPaymentMethod };
}
