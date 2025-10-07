
'use client';

import { ChatLayout } from '@/components/chat/chat-layout';
import type { Contact, Message } from '@/types/chat';
import { useChat } from '@/context/chat-context';

export function ChatPageContent() {
  const { contacts, messages, selectedContact, setSelectedContact, addMessage, deleteMessage, self } = useChat();

  const contactMessages = selectedContact && self
    ? messages.filter(
        (msg) => 
            (msg.senderId === selectedContact?.id && msg.recipientId === self.id) || 
            (msg.senderId === self.id && msg.recipientId === selectedContact?.id)
      )
    : [];
  
  const handleSendMessage = (content: string, type: 'text' | 'audio' | 'image' | 'file', data?: any) => {
    if (selectedContact) {
      addMessage(content, selectedContact.id, type, data);
    }
  };

  const handleSelectContact = (contact: Contact | null) => {
    setSelectedContact(contact);
  };
  
  const handleDeleteMessage = (messageId: string) => {
    deleteMessage(messageId);
  }

  return (
    <main className="flex-grow h-[calc(100vh-60px)]">
      <ChatLayout
        contacts={contacts}
        messages={contactMessages}
        selectedContact={selectedContact}
        onSelectContact={handleSelectContact}
        onSendMessage={handleSendMessage}
        onDeleteMessage={handleDeleteMessage}
      />
    </main>
  );
}
