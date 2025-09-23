
'use client';

import { ChatContactList } from './chat-contact-list';
import { ChatMessages } from './chat-messages';
import { useChat } from '@/context/chat-context';
import type { Contact, Message } from '@/types/chat';
import { cn } from '@/lib/utils';

interface ChatLayoutProps {
  contacts: Contact[];
  messages: Message[];
  selectedContact: Contact | null;
  onSelectContact: (contact: Contact | null) => void;
  onSendMessage: (message: string, type: 'text' | 'audio', audioUrl?: string, duration?: number) => void;
}

export function ChatLayout({
  contacts,
  messages,
  selectedContact,
  onSelectContact,
  onSendMessage,
}: ChatLayoutProps) {
  
  return (
    <div className="grid grid-cols-10 h-full w-full">
      <div
        className={cn(
          'border-r col-span-10 md:col-span-3 lg:col-span-3',
          selectedContact && 'hidden md:block'
        )}
      >
        <ChatContactList
          contacts={contacts}
          onSelectContact={onSelectContact}
          selectedContactId={selectedContact?.id}
        />
      </div>

      <div className={cn(
        'col-span-10 md:col-span-7 lg:col-span-7',
        !selectedContact && 'hidden md:block'
      )}>
        {selectedContact ? (
            <ChatMessages
                messages={messages}
                selectedContact={selectedContact}
                onExitChat={() => onSelectContact(null)}
                onSendMessage={onSendMessage}
            />
        ) : (
            <div className="hidden md:flex flex-col items-center justify-center h-full text-center bg-muted/50">
                <p className="text-lg font-semibold">Select a chat to start messaging</p>
                <p className="text-muted-foreground">Your conversations will appear here.</p>
            </div>
        )}
       </div>
    </div>
  );
}
