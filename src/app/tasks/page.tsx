
'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { TasksPageContent } from './tasks-page-content';

export default function TasksPage() {
  return (
    <AppLayout>
      <TasksPageContent />
    </AppLayout>
  );
}
