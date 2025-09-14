
'use client';

import { ChatContactList } from './chat-contact-list';
import { ChatMessages } from './chat-messages';
import { Contact, Message } from '@/types/chat';

interface ChatLayoutProps {
  contacts: Contact[];
  messages: Message[];
  selectedContact: Contact | null;
  onSelectContact: (contact: Contact | null) => void;
}

export function ChatLayout({ contacts, messages, selectedContact, onSelectContact }: ChatLayoutProps) {

  if (selectedContact) {
    return (
      <div className="h-full w-full">
        <ChatMessages 
          messages={messages} 
          selectedContact={selectedContact} 
          onExitChat={() => onSelectContact(null)}
          isFullScreen={true}
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 h-full w-full">
      <div className="col-span-1 border-r">
        <ChatContactList 
          contacts={contacts} 
          onSelectContact={onSelectContact}
        />
      </div>
    </div>
  );
}
