
'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { VideoCallUI } from '@/components/meetings/video-call-ui';
import { useParams } from 'next/navigation';

export default function MeetingPage() {
  const params = useParams();
  const meetingId = typeof params.meetingId === 'string' ? params.meetingId : '';

  // In a real app, you'd fetch meeting details using meetingId
  const meetingDetails = {
    id: meetingId,
    title: 'Job interview for Senior UX Engineer',
    category: 'Design',
  };

  return (
    <AppLayout>
        <VideoCallUI meeting={meetingDetails} />
    </AppLayout>
  );
}
