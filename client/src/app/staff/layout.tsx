import { RoleGuard } from '@/components';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Salon Booking - Staff Dashboard',
};

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoleGuard allowedRoles={['STAFF', 'ADMIN']}>{children}</RoleGuard>;
}
