
'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { CompletedProjectsTable } from '@/components/performance/completed-projects-table';
import { PerformanceCoach } from '@/components/performance/performance-coach';

export default function PerformancePage() {
  return (
    <AppLayout>
      <main className="flex-grow p-4 md:p-8 space-y-4 md:space-y-8">
        <div className="grid grid-cols-10 gap-8">
          <div className="col-span-10 lg:col-span-7">
            <CompletedProjectsTable />
          </div>
          <div className="col-span-10 lg:col-span-3">
            <PerformanceCoach />
          </div>
        </div>
      </main>
    </AppLayout>
  );
}
