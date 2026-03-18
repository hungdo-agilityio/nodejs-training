import { RoleGuard, UserHeader } from '@/components';

export default function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={['USER']}>
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50">
        <UserHeader />
        {children}
      </div>
    </RoleGuard>
  );
}
