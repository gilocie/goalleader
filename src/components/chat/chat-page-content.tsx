

'use client';

import { useState, useCallback, useEffect } from 'react';
import { ChatLayout } from '@/components/chat/chat-layout';
import type { Contact, Message } from '@/types/chat';
import { useChat } from '@/context/chat-context';
import { NewChatDialog } from './new-chat-dialog';

export function ChatPageContent() {
  const { 
    contacts, 
    messages, 
    selectedContact, 
    setSelectedContact, 
    addMessage, 
    deleteMessage, 
    self, 
    pendingSelectedContactId, 
    setPendingSelectedContactId, 
    allContacts 
  } = useChat();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);

  useEffect(() => {
    if (pendingSelectedContactId && allContacts.length > 0) {
        const contactToSelect = allContacts.find(c => c.id === pendingSelectedContactId);
        if (contactToSelect) {
            setSelectedContact(contactToSelect);
            setPendingSelectedContactId(null);
        }
    }
  }, [pendingSelectedContactId, allContacts, setSelectedContact, setPendingSelectedContactId]);

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

  const handleSelectContact = useCallback((contact: Contact | null) => {
    setSelectedContact(contact);
    setIsProfileOpen(false);
  }, [setSelectedContact]);
  
  const handleDeleteMessage = (messageId: string, deleteForEveryone: boolean) => {
    deleteMessage(messageId, deleteForEveryone);
  }
  
  const handleStartChat = (contact: Contact) => {
    handleSelectContact(contact);
    setIsNewChatOpen(false);
  }

  return (
    <div className="flex-1 w-full overflow-hidden max-h-[calc(100vh-60px)]">
      <ChatLayout
        contacts={contacts}
        messages={contactMessages}
        selectedContact={selectedContact}
        onSelectContact={handleSelectContact}
        onSendMessage={handleSendMessage}
        onDeleteMessage={handleDeleteMessage}
        isProfileOpen={isProfileOpen}
        onToggleProfile={() => setIsProfileOpen(prev => !prev)}
      />
       <NewChatDialog 
        isOpen={isNewChatOpen}
        onOpenChange={setIsNewChatOpen}
        onStartChat={handleStartChat}
    />
    </div>
  );
}
