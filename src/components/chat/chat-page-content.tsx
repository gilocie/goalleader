
'use client';

import { ChatLayout } from '@/components/chat/chat-layout';
import type { Contact, Message } from '@/types/chat';
import { useChat } from '@/context/chat-context';

export function ChatPageContent() {
  const { contacts, messages, selectedContact, setSelectedContact, addMessage, self } = useChat();

  const contactMessages = selectedContact && self
    ? messages.filter(
        (msg) => 
            (msg.senderId === selectedContact?.id && msg.recipientId === self.id) || 
            (msg.senderId === self.id && msg.recipientId === selectedContact?.id)
      )
    : [];
  
  const handleSendMessage = (content: string, type: 'text' | 'audio', audioUrl?: string, duration?: number) => {
    if (selectedContact) {
      const messageData: Partial<Message> = {
        audioUrl,
        audioDuration: duration,
      };
      addMessage(content, selectedContact.id, type, messageData);
    }
  };

  const handleSelectContact = (contact: Contact | null) => {
    setSelectedContact(contact);
  };

  return (
    <main className="flex-grow h-full">
      <ChatLayout
        contacts={contacts}
        messages={contactMessages}
        selectedContact={selectedContact}
        onSelectContact={handleSelectContact}
        onSendMessage={handleSendMessage}
      />
    </main>
  );
}
