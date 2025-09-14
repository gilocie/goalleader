
'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { ChatLayout } from '@/components/chat/chat-layout';
import type { Contact, Message } from '@/types/chat';

const teamMembers: Contact[] = [
    { id: 'sophia-davis-m1', name: 'Sophia Davis', role: 'Lead Developer', status: 'online' as const, lastMessage: 'On it!', lastMessageTime: '5m', unreadCount: 2, lastMessageReadStatus: 'read' },
    { id: 'liam-martinez-m2', name: 'Liam Martinez', role: 'Frontend Developer', status: 'last seen today at 1:30 PM', lastMessage: 'See you tomorrow.', lastMessageTime: '1h', lastMessageReadStatus: 'delivered' },
    { id: 'ava-wilson-m3', name: 'Ava Wilson', role: 'Backend Developer', status: 'online' as const, lastMessage: 'I pushed the latest changes.', lastMessageTime: '20m', lastMessageReadStatus: 'sent' },
    { id: 'noah-brown-m4', name: 'Noah Brown', role: 'UI/UX Designer', status: 'online' as const, lastMessage: 'The mockups are ready for review.', lastMessageTime: '1h', lastMessageReadStatus: 'read' },
    { id: 'emma-johnson-m5', name: 'Emma Johnson', role: 'QA Engineer', status: 'last seen yesterday at 11:15 PM', lastMessage: 'I have a question about the new feature.', lastMessageTime: '3h', lastMessageReadStatus: 'delivered' },
    { id: 'oliver-garcia-m6', name: 'Oliver Garcia', role: 'DevOps Engineer', status: 'online' as const, lastMessage: 'The staging server is updated.', lastMessageTime: '10m', unreadCount: 1, lastMessageReadStatus: 'read' },
    { id: 'charlotte-rodriguez-m7', name: 'Charlotte Rodriguez', role: 'Project Manager', status: 'last seen 2 days ago', lastMessage: 'Meeting at 3 PM.', lastMessageTime: '4h', lastMessageReadStatus: 'sent' },
    { id: 'james-smith-m8', name: 'James Smith', role: 'Data Scientist', status: 'online' as const, lastMessage: 'The data analysis is complete.', lastMessageTime: '30m', lastMessageReadStatus: 'read' },
];

const messages: Message[] = [
    { id: 'msg1', senderId: 'sophia-davis-m1', recipientId: 'user', content: "Hey! Just wanted to check in on the progress for the new auth flow.", timestamp: "10:00 AM" },
    { id: 'msg2', senderId: 'user', recipientId: 'sophia-davis-m1', content: "Hey Sophia, things are going well. I've finished the main logic and am now working on the UI.", timestamp: "10:01 AM", readStatus: 'read' },
    { id: 'msg3', senderId: 'sophia-davis-m1', recipientId: 'user', content: "Great to hear! Let me know if you run into any blockers.", timestamp: "10:02 AM" },
    { id: 'msg4', senderId: 'user', recipientId: 'sophia-davis-m1', content: "Will do. I might have a question about the token handling later today.", timestamp: "10:03 AM", readStatus: 'delivered' },
    { id: 'msg5', senderId: 'sophia-davis-m1', recipientId: 'user', content: "Sure, feel free to ping me anytime.", timestamp: "10:04 AM" },
    { id: 'msg6', senderId: 'user', recipientId: 'sophia-davis-m1', content: "Thanks!", timestamp: "10:05 AM", readStatus: 'sent' },

];


export default function ChatPage() {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(teamMembers[0]);

  const contactMessages = messages.filter(
      (msg) => msg.senderId === selectedContact?.id || msg.recipientId === selectedContact?.id
  );

  return (
    <AppLayout>
      <main className="flex-grow h-full">
        <ChatLayout
            contacts={teamMembers}
            messages={contactMessages}
            selectedContact={selectedContact}
            onSelectContact={setSelectedContact}
        />
      </main>
    </AppLayout>
  );
}
