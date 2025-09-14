
'use client';

import { ChatContactList } from './chat-contact-list';
import { ChatMessages } from './chat-messages';
import { Contact, Message } from '@/types/chat';
import { ChatUserProfile } from './chat-user-profile';
import { cn } from '@/lib/utils';
import { Bot } from 'lucide-react';

interface ChatLayoutProps {
  contacts: Contact[];
  messages: Message[];
  selectedContact: Contact | null;
  onSelectContact: (contact: Contact | null) => void;
}

export function ChatLayout({ contacts, messages, selectedContact, onSelectContact }: ChatLayoutProps) {
  return (
    <div className="grid grid-cols-10 h-full w-full">
      <div className={cn(
          "col-span-10 border-r", 
          selectedContact ? 'hidden' : 'block'
      )}>
        <ChatContactList 
          contacts={contacts} 
          onSelectContact={onSelectContact}
          selectedContactId={selectedContact?.id}
        />
      </div>

      <div className={cn(
          "col-span-10", 
          !selectedContact && 'hidden'
      )}>
        {selectedContact && (
          <div className="h-full w-full">
            <ChatMessages 
              messages={messages} 
              selectedContact={selectedContact} 
              onExitChat={() => onSelectContact(null)}
              isFullScreen={!!selectedContact} 
            />
          </div>
        )}
      </div>
    </div>
  );
}
