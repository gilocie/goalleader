'use client';

import { ChatContactList } from './chat-contact-list';
import { ChatMessages } from './chat-messages';
import { Contact, Message } from '@/types/chat';
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
  return (
    <div className="grid grid-cols-1 md:grid-cols-10 h-full w-full">
      {/* LEFT SIDE: Contact list */}
      <div
        className={cn(
          'border-r',
          selectedContact ? 'hidden md:block md:col-span-3' : 'col-span-10 md:col-span-3'
        )}
      >
        <ChatContactList
          contacts={contacts}
          onSelectContact={onSelectContact}
          selectedContactId={selectedContact?.id}
        />
      </div>

      {/* RIGHT SIDE: Chat messages (only renders if a contact is selected) */}
      {selectedContact && (
        <div className="col-span-10 md:col-span-7">
          <ChatMessages
            messages={messages}
            selectedContact={selectedContact}
            onExitChat={() => onSelectContact(null)}
            isFullScreen={!!selectedContact}
            onSendMessage={onSendMessage}
          />
        </div>
      )}
    </div>
  );
}
