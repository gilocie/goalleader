
'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { ReportsPageContent } from './reports-page-content';
import { ReportsProvider } from '@/context/reports-context';

export default function ReportsPage() {
  return (
    <AppLayout>
        <ReportsPageContent />
    </AppLayout>
  );
}
