
'use client';

import { DashboardStats } from '@/components/dashboard/dashboard-stats';
import { ProjectAnalyticsChart } from '@/components/dashboard/project-analytics-chart';
import { GoalReaderAIChat } from '@/components/dashboard/goal-reader-ai-chat';
import { ProjectProgress } from '@/components/dashboard/project-progress';
import { Reminders } from '@/components/dashboard/reminders';
import { ProjectList } from '@/components/dashboard/project-list';
import { Noticeboard } from '@/components/dashboard/noticeboard';
import { AppLayout } from '@/components/layout/app-layout';

export default function Home() {
  return (
    <AppLayout>
      <main className="flex-grow p-4 md:p-8 space-y-4 md:space-y-8">
        <div className="grid grid-cols-2 gap-4 md:gap-8 lg:grid-cols-4">
          <DashboardStats />
        </div>
        <div className="grid grid-cols-10 gap-4">
          <div className="col-span-10 lg:col-span-7 h-full md:h-[592px]">
            <ProjectList />
          </div>
          <div className="col-span-10 lg:col-span-3 grid grid-cols-1 gap-4 auto-rows-min">
            <ProjectAnalyticsChart />
            <ProjectProgress />
          </div>
        </div>
        <div className="grid grid-cols-10 gap-4">
          <div className="col-span-10 lg:col-span-7 h-full md:h-[430px]">
              <GoalReaderAIChat />
          </div>
          <div className="col-span-10 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 auto-rows-min">
            <Reminders />
            <Noticeboard />
          </div>
        </div>
      </main>
    </AppLayout>
  );
}
