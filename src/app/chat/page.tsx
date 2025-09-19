
'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { ChatLayout } from '@/components/chat/chat-layout';
import type { Contact } from '@/types/chat';
import { useChat } from '@/context/chat-context';


export default function ChatPage() {
  const { contacts, messages } = useChat();
  const [selectedContact, setSelectedContact] = useState<Contact | null>(contacts[0]);

  const contactMessages = messages.filter(
      (msg) => msg.senderId === selectedContact?.id || msg.recipientId === selectedContact?.id
  );

  return (
    <AppLayout>
      <main className="flex-grow h-full">
        <ChatLayout
            contacts={contacts}
            messages={contactMessages}
            selectedContact={selectedContact}
            onSelectContact={setSelectedContact}
        />
      </main>
    </AppLayout>
  );
}
