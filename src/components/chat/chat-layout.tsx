
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
      <div className={cn("col-span-10 md:col-span-3 border-r", !selectedContact && "col-span-10")}>
        <ChatContactList 
          contacts={contacts} 
          onSelectContact={onSelectContact}
          selectedContactId={selectedContact?.id}
        />
      </div>

      <div className={cn("col-span-10 md:col-span-7", selectedContact ? 'block' : 'hidden md:flex')}>
        {selectedContact ? (
          <div className="h-full w-full">
            <ChatMessages 
              messages={messages} 
              selectedContact={selectedContact} 
              onExitChat={() => onSelectContact(null)}
              isFullScreen={!selectedContact} 
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
            <Bot className="h-16 w-16 mb-4" />
            <h2 className="text-xl font-semibold">Welcome to Goal Leader Chat</h2>
            <p>Select a contact to start chatting.</p>
          </div>
        )}
      </div>
    </div>
  );
}
