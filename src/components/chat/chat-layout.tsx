
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
  onSendMessage: (message: string) => void;
}

export function ChatLayout({ contacts, messages, selectedContact, onSelectContact, onSendMessage }: ChatLayoutProps) {
  return (
    <div className="grid grid-cols-10 h-full w-full">
      <div className={cn(
          "col-span-10 md:col-span-3 border-r", 
          selectedContact ? 'hidden md:block' : 'block'
      )}>
        <ChatContactList 
          contacts={contacts} 
          onSelectContact={onSelectContact}
          selectedContactId={selectedContact?.id}
        />
      </div>

      <div className={cn(
          "col-span-10 md:col-span-7", 
          !selectedContact && 'hidden md:flex'
      )}>
        {selectedContact ? (
          <div className="h-full w-full">
            <ChatMessages 
              messages={messages} 
              selectedContact={selectedContact} 
              onExitChat={() => onSelectContact(null)}
              isFullScreen={!!selectedContact} 
              onSendMessage={onSendMessage}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-4">
              <Bot className="h-16 w-16 text-primary" />
              <h3 className="font-semibold text-lg">Welcome to Chat</h3>
              <p className="text-muted-foreground max-w-sm">
                Select a contact from the left panel to start a conversation. You can send messages, files, and start calls.
              </p>
          </div>
        )}
      </div>
    </div>
  );
}
