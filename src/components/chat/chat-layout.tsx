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
  onSendMessage: (message: string) => void;
}

export function ChatLayout({
  contacts,
  messages,
  selectedContact,
  onSelectContact,
  onSendMessage,
}: ChatLayoutProps) {
  const { self } = useChat();
  return (
    <div className="grid grid-cols-10 h-full w-full">
      <div
        className={cn(
          'border-r',
          selectedContact ? 'hidden' : 'block col-span-10'
        )}
      >
        <ChatContactList
          contacts={contacts}
          onSelectContact={onSelectContact}
          selectedContactId={selectedContact?.id}
        />
      </div>

      {selectedContact && self && (
        <div className="col-span-10">
          <ChatMessages
            messages={messages}
            selectedContact={selectedContact}
            self={self}
            onExitChat={() => onSelectContact(null)}
            onSendMessage={onSendMessage}
          />
        </div>
      )}
    </div>
  );
}
