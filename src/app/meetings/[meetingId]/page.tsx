
'use client';

import { Suspense } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { VideoCallUI } from '@/components/meetings/video-call-ui';
import { useParams, useSearchParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

function MeetingPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const meetingId = typeof params.meetingId === 'string' ? params.meetingId : '';

  const initialIsMuted = searchParams.get('muted') === 'true';
  const initialIsVideoOff = searchParams.get('videoOff') === 'true';
  const aiAllowed = searchParams.get('aiAllowed') === 'true';

  // In a real app, you'd fetch meeting details using meetingId
  const meetingDetails = {
    id: meetingId,
    title: 'Job interview for Senior UX Engineer',
    category: 'Design',
  };

  return (
    <VideoCallUI 
        meeting={meetingDetails}
        initialIsMuted={initialIsMuted}
        initialIsVideoOff={initialIsVideoOff}
        aiAllowed={aiAllowed}
    />
  );
}

export default function MeetingPage() {
  return (
    <AppLayout>
        <Suspense fallback={<Skeleton className="w-full h-full" />}>
            <MeetingPageContent />
        </Suspense>
    </AppLayout>
  );
}
