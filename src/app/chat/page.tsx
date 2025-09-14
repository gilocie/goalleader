
'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { ChatLayout } from '@/components/chat/chat-layout';

const teamMembers = [
    { id: 'sophia-davis-m1', name: 'Sophia Davis', role: 'Lead Developer', status: 'online' as const, lastMessage: 'On it!', lastMessageTime: '5m' },
    { id: 'liam-martinez-m2', name: 'Liam Martinez', role: 'Frontend Developer', status: 'offline' as const, lastMessage: 'See you tomorrow.', lastMessageTime: '1h' },
    { id: 'ava-wilson-m3', name: 'Ava Wilson', role: 'Backend Developer', status: 'online' as const, lastMessage: 'I pushed the latest changes.', lastMessageTime: '20m' },
    { id: 'noah-brown-m4', name: 'Noah Brown', role: 'UI/UX Designer', status: 'online' as const, lastMessage: 'The mockups are ready for review.', lastMessageTime: '1h' },
    { id: 'emma-johnson-m5', name: 'Emma Johnson', role: 'QA Engineer', status: 'offline' as const, lastMessage: 'I have a question about the new feature.', lastMessageTime: '3h' },
    { id: 'oliver-garcia-m6', name: 'Oliver Garcia', role: 'DevOps Engineer', status: 'online' as const, lastMessage: 'The staging server is updated.', lastMessageTime: '10m' },
    { id: 'charlotte-rodriguez-m7', name: 'Charlotte Rodriguez', role: 'Project Manager', status: 'offline' as const, lastMessage: 'Meeting at 3 PM.', lastMessageTime: '4h' },
    { id: 'james-smith-m8', name: 'James Smith', role: 'Data Scientist', status: 'online' as const, lastMessage: 'The data analysis is complete.', lastMessageTime: '30m' },
];

const messages = [
    { id: 'msg1', senderId: 'sophia-davis-m1', recipientId: 'user', content: "Hey! Just wanted to check in on the progress for the new auth flow.", timestamp: "10:00 AM" },
    { id: 'msg2', senderId: 'user', recipientId: 'sophia-davis-m1', content: "Hey Sophia, things are going well. I've finished the main logic and am now working on the UI.", timestamp: "10:01 AM" },
    { id: 'msg3', senderId: 'sophia-davis-m1', recipientId: 'user', content: "Great to hear! Let me know if you run into any blockers.", timestamp: "10:02 AM" },
    { id: 'msg4', senderId: 'user', recipientId: 'sophia-davis-m1', content: "Will do. I might have a question about the token handling later today.", timestamp: "10:03 AM" },
    { id: 'msg5', senderId: 'sophia-davis-m1', recipientId: 'user', content: "Sure, feel free to ping me anytime.", timestamp: "10:04 AM" },
];


export default function ChatPage() {
  return (
    <AppLayout>
      <main className="flex-grow h-full">
        <ChatLayout
            contacts={teamMembers}
            messages={messages}
            selectedContact={teamMembers[0]}
        />
      </main>
    </AppLayout>
  );
}
