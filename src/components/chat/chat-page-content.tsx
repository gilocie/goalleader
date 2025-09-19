'use client';

import { ChatLayout } from '@/components/chat/chat-layout';
import type { Contact } from '@/types/chat';
import { useChat } from '@/context/chat-context';

export function ChatPageContent() {
  const { contacts, messages, selectedContact, setSelectedContact } = useChat();

  const contactMessages = selectedContact 
    ? messages.filter(
        (msg) => msg.senderId === selectedContact?.id || msg.recipientId === selectedContact?.id
      )
    : [];

  return (
    <main className="flex-grow h-full">
      <ChatLayout
        contacts={contacts}
        messages={contactMessages}
        selectedContact={selectedContact}
        onSelectContact={setSelectedContact}
      />
    </main>
  );
}
