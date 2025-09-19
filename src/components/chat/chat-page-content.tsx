'use client';

import { ChatLayout } from '@/components/chat/chat-layout';
import type { Contact } from '@/types/chat';
import { useChat } from '@/context/chat-context';

export function ChatPageContent() {
  const { contacts, messages, selectedContact, setSelectedContact, addMessage } = useChat();

  const contactMessages = selectedContact 
    ? messages.filter(
        (msg) => 
            (msg.senderId === selectedContact?.id && msg.recipientId === 'user') || 
            (msg.senderId === 'user' && msg.recipientId === selectedContact?.id)
      )
    : [];
  
  const handleSendMessage = (message: string) => {
    if (selectedContact) {
      addMessage(message, selectedContact.id);
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
