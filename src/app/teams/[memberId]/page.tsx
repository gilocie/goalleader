
'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { MemberHeader } from '@/components/teams/member-header';
import { PerformanceOverview } from '@/components/teams/performance-overview';
import { DailyTodoList } from '@/components/teams/daily-todo-list';
import { ManagerFeedback } from '@/components/teams/manager-feedback';
import { PerformanceCoach } from '@/components/performance/performance-coach';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const teamMembers = [
  { id: 'team-member-1', name: 'Sophia Davis', role: 'Lead Developer', status: 'online' },
  { id: 'team-member-2', name: 'Liam Martinez', role: 'Frontend Developer', status: 'offline' },
  { id: 'team-member-3', name: 'Ava Wilson', role: 'Backend Developer', status: 'online' },
  { id: 'team-member-4', name: 'Noah Brown', role: 'UI/UX Designer', status: 'online' },
  { id: 'team-member-5', name: 'Emma Johnson', role: 'QA Engineer', status: 'offline' },
  { id: 'team-member-6', name: 'Oliver Garcia', role: 'DevOps Engineer', status: 'online' },
  { id: 'team-member-7', name: 'Charlotte Rodriguez', role: 'Project Manager', status: 'offline' },
  { id: 'team-member-8', name: 'James Smith', role: 'Data Scientist', status: 'online' },
];

export default function MemberPerformancePage({ params: { memberId } }: { params: { memberId: string } }) {
  const member = teamMembers.find(m => m.id === memberId);
  const avatar = PlaceHolderImages.find(img => img.id === memberId);

  if (!member) {
    return (
      <AppLayout>
        <main className="flex-grow p-4 md:p-8">
          <p>Team member not found.</p>
        </main>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <main className="flex-grow p-4 md:p-8 space-y-8">
        <MemberHeader name={member.name} role={member.role} avatarUrl={avatar?.imageUrl} avatarHint={avatar?.imageHint} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <PerformanceOverview />
            <DailyTodoList />
          </div>
          <div className="space-y-8">
            <PerformanceCoach />
            <ManagerFeedback />
          </div>
        </div>
      </main>
    </AppLayout>
  );
}
