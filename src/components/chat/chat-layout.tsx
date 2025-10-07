
'use client';

import { ChatContactList } from './chat-contact-list';
import { ChatMessages } from './chat-messages';
import { ChatUserProfile } from './chat-user-profile';
import { useChat } from '@/context/chat-context';
import type { Contact, Message } from '@/types/chat';
import { cn } from '@/lib/utils';
import { useSidebar } from '../layout/sidebar';

interface ChatLayoutProps {
  contacts: Contact[];
  messages: Message[];
  selectedContact: Contact | null;
  onSelectContact: (contact: Contact | null) => void;
  onSendMessage: (message: string, type: 'text' | 'audio' | 'image' | 'file', data?: any) => void;
  onDeleteMessage: (messageId: string) => void;
  isProfileOpen: boolean;
  onToggleProfile: () => void;
}

export function ChatLayout({
  contacts,
  messages,
  selectedContact,
  onSelectContact,
  onSendMessage,
  onDeleteMessage,
  isProfileOpen,
  onToggleProfile,
}: ChatLayoutProps) {
  const { self } = useChat();

  const getGridCols = () => {
    if (isProfileOpen) {
      return 'grid-cols-[minmax(280px,1.2fr)_minmax(0,3fr)_minmax(280px,1fr)]';
    }
    return 'grid-cols-[minmax(280px,1.2fr)_minmax(0,3fr)]';
  }

  return (
    <div className={cn("grid h-full w-full transition-all duration-300", getGridCols())}>
      {/* Contact List */}
      <div
        className={cn(
          'border-r bg-background h-full flex flex-col',
          selectedContact && !isProfileOpen ? 'hidden lg:flex' : '',
          !selectedContact && !isProfileOpen ? 'col-span-full lg:col-span-1' : '',
        )}
      >
        <ChatContactList
          contacts={contacts}
          onSelectContact={onSelectContact}
          selectedContactId={selectedContact?.id}
        />
      </div>

      {/* Main Chat Area */}
      {selectedContact && self ? (
         <div className="flex flex-col h-full overflow-hidden">
           <ChatMessages
            messages={messages}
            selectedContact={selectedContact}
            onExitChat={() => onSelectContact(null)}
            onSendMessage={onSendMessage}
            onDeleteMessage={onDeleteMessage}
            onToggleProfile={onToggleProfile}
          />
        </div>
      ) : (
        <div className="hidden lg:flex flex-col items-center justify-center bg-muted/30 h-full">
            <p className="text-muted-foreground text-lg">Select a contact to start chatting</p>
        </div>
      )}

      {/* Profile Panel */}
      {selectedContact && isProfileOpen && (
        <div className="hidden lg:flex flex-col h-full border-l bg-background">
          <ChatUserProfile contact={selectedContact} />
        </div>
      )}
    </div>
  );
}
