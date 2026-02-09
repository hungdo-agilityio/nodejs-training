import { RoleGuard } from '@/components';

export default function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoleGuard allowedRoles={['USER']}>{children}</RoleGuard>;
}
