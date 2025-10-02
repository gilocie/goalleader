
'use client';

import { AppLayout } from '@/components/layout/app-layout';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const AdminPageContent = dynamic(() => import('./admin-page-content').then(mod => mod.AdminPageContent), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-screen" />,
});

export default function AdminPage() {
  return (
    <AppLayout>
      <AdminPageContent />
    </AppLayout>
  );
}
