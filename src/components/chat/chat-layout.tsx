'use client';

import { ChatContactList } from './chat-contact-list';
import { ChatMessages } from './chat-messages';
import type { Contact, Message } from '@/types/chat';
import { cn } from '@/lib/utils';
import { useChat } from '@/context/chat-context';

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
      <div className="col-span-10 md:col-span-3 lg:col-span-2 border-r">
        <ChatContactList
          contacts={contacts}
          onSelectContact={onSelectContact}
          selectedContactId={selectedContact?.id}
        />
      </div>
      <div className="col-span-10 md:col-span-7 lg:col-span-8">
          {selectedContact ? (
            <ChatMessages
                messages={messages}
                selectedContact={selectedContact}
                onExitChat={() => onSelectContact(null)}
                onSendMessage={onSendMessage}
            />
          ) : (
             <div className="h-full items-center justify-center hidden md:flex">
                <p className="text-muted-foreground">Select a contact to start chatting</p>
            </div>
          )}
      </div>
    </div>
  );
}
