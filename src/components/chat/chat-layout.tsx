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
    <div className="flex h-full w-full">
      {/* LEFT SIDE: Contact list */}
      <div
        className={cn(
          'h-full border-r md:w-[280px] lg:w-[320px] flex-shrink-0',
          selectedContact 
            ? 'hidden md:flex md:flex-col'
            : 'w-full flex flex-col'
        )}
      >
        <ChatContactList
          contacts={contacts}
          onSelectContact={onSelectContact}
          selectedContactId={selectedContact?.id}
        />
      </div>

      {/* RIGHT SIDE: only render if a contact is selected */}
      {selectedContact && self && (
        <div className="flex-1 h-full">
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
