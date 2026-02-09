import { RoleGuard } from '@/components';

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoleGuard allowedRoles={['STAFF', 'ADMIN']}>{children}</RoleGuard>;
}
