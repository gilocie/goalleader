
'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { VideoCallUI } from '@/components/meetings/video-call-ui';

export default function MeetingPage({ params }: { params: { meetingId: string } }) {
  // In a real app, you'd fetch meeting details using params.meetingId
  const meetingDetails = {
    id: params.meetingId,
    title: 'Job interview for Senior UX Engineer',
    category: 'Design',
  };

  return (
    <AppLayout>
        <VideoCallUI meeting={meetingDetails} />
    </AppLayout>
  );
}
