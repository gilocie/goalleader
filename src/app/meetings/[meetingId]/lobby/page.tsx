
'use client';

import { MeetingLobby } from '@/components/meetings/meeting-lobby';
import { useParams } from 'next/navigation';

export default function MeetingLobbyPage() {
  const params = useParams();
  const meetingId = typeof params.meetingId === 'string' ? params.meetingId : '';

  return (
    <div className="bg-gray-800 min-h-screen">
      <MeetingLobby meetingId={meetingId} />
    </div>
  );
}
