'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  useEffect(() => {
    // Client-side check: if the admin-logged-in cookie is gone, redirect to login
    if (pathname !== '/admin/login') {
      const isLoggedIn = document.cookie
        .split('; ')
        .some((c) => c.startsWith('admin-logged-in='));

      if (!isLoggedIn) {
        window.location.href = `/admin/login?redirect=${encodeURIComponent(pathname)}`;
      }
    }
  }, [pathname]);

  // Don't show sidebar on login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
