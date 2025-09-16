
'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { MemberHeader } from '@/components/teams/member-header';
import { PerformanceOverview } from '@/components/teams/performance-overview';
import { DailyTodoList } from '@/components/teams/daily-todo-list';
import { ManagerFeedback } from '@/components/teams/manager-feedback';
import { PerformanceCoach } from '@/components/performance/performance-coach';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useParams } from 'next/navigation';

const teamMembers = [
  { id: 'patrick-achitabwino-m1', name: 'Patrick Achitabwino', role: 'Consultant', status: 'online' as const },
  { id: 'frank-mhango-m2', name: 'Frank Mhango', role: 'Consultant', status: 'offline' as const },
  { id: 'denis-maluwasa-m3', name: 'Denis Maluwasa', role: 'Consultant', status: 'online' as const },
  { id: 'gift-banda-m4', name: 'Gift Banda', role: 'Consultant', status: 'online' as const },
  { id: 'chiyanjano-mkandawire-m5', name: 'Chiyanjano Mkandawire', role: 'Consultant', status: 'offline' as const },
  { id: 'wezi-chisale-m6', name: 'Wezi Chisale', role: 'Consultant', status: 'online' as const },
  { id: 'charity-moyo-m7', name: 'Charity Moyo', role: 'Consultant', status: 'offline' as const },
  { id: 'fumbani-mwenefumbo-m8', name: 'Fumbani Mwenefumbo', role: 'Consultant', status: 'online' as const },
  { id: 'rose-kabudula-m9', name: 'Rose Kabudula', role: 'Consultant', status: 'online' as const },
];

export default function MemberPerformancePage() {
  const params = useParams();
  const memberId = typeof params.memberId === 'string' ? params.memberId : '';
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
        <MemberHeader name={member.name} role={member.role} status={member.status} avatarUrl={avatar?.imageUrl} avatarHint={avatar?.imageHint} />
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
