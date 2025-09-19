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
    <div className="flex h-full w-full">
      {/* LEFT SIDE: Contact list */}
      <div
        className={cn(
          'h-full border-r',
          selectedContact 
            ? 'hidden' // Hide contact list completely when chat is selected
            : 'w-full' // Takes full width when no contact is selected
        )}
      >
        <ChatContactList
          contacts={contacts}
          onSelectContact={onSelectContact}
          selectedContactId={selectedContact?.id}
        />
      </div>

      {/* RIGHT SIDE: only render if a contact is selected */}
      {selectedContact && (
        <div className="flex-1 h-full">
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