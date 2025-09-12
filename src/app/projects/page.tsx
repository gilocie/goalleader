
'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { CompletedProjectsTable } from '@/components/projects/completed-projects-table';

export default function ProjectsPage() {
  return (
    <AppLayout>
      <main className="flex-grow p-4 md:p-8 space-y-4 md:space-y-8">
        <CompletedProjectsTable />
      </main>
    </AppLayout>
  );
}
