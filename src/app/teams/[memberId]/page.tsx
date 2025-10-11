
'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { MemberHeader } from '@/components/teams/member-header';
import { PerformanceOverview } from '@/components/teams/performance-overview';
import { DailyTodoList } from '@/components/teams/daily-todo-list';
import { ManagerFeedback } from '@/components/teams/manager-feedback';
import { TeamMemberPerformanceCoach } from '@/components/performance/team-member-performance-coach';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useParams, useSearchParams } from 'next/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUser } from '@/context/user-context';
import { Skeleton } from '@/components/ui/skeleton';


export default function MemberPerformancePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { allTeamMembers, loading } = useUser();
  const memberId = typeof params.memberId === 'string' ? params.memberId : '';
  const reportContent = searchParams.get('reportContent');
  
  if (loading) {
    return (
        <AppLayout>
            <main className="flex-grow p-4 md:p-8">
                 <Skeleton className="w-full h-screen" />
            </main>
        </AppLayout>
    )
  }
  
  const member = allTeamMembers.find(m => m.id === memberId);
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
      <ScrollArea className="h-full">
        <main className="flex-grow p-4 md:p-8 space-y-8 mb-5">
          <MemberHeader name={member.name} role={member.role} status={member.status} avatarUrl={avatar?.imageUrl} avatarHint={avatar?.imageHint} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <PerformanceOverview />
              <DailyTodoList />
            </div>
            <div className="space-y-8">
              <TeamMemberPerformanceCoach member={member} />
              <ManagerFeedback reportContent={reportContent} />
            </div>
          </div>
        </main>
      </ScrollArea>
    </AppLayout>
  );
}
