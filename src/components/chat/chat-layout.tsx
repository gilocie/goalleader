
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
}

export function ChatLayout({
  contacts,
  messages,
  selectedContact,
  onSelectContact,
  onSendMessage,
  onDeleteMessage,
}: ChatLayoutProps) {
  const { self } = useChat();
  const { open: isSidebarOpen } = useSidebar();
  
  const gridColsClass = isSidebarOpen ? 'lg:grid-cols-12' : 'lg:grid-cols-10';

  return (
    <div className={cn("grid h-full w-full", gridColsClass)}>
      {/* Contact List */}
      <div
        className={cn(
          'border-r',
          // On mobile, hide if a contact is selected.
          // On desktop, always show and define column span.
          selectedContact ? 'hidden lg:block' : 'col-span-full lg:col-span-auto',
           isSidebarOpen ? 'lg:col-span-3' : 'lg:col-span-3'
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
         <div className={cn(
            "col-span-full lg:col-span-auto",
            isSidebarOpen ? 'lg:col-span-6' : 'lg:col-span-4'
        )}>
          <ChatMessages
            messages={messages}
            selectedContact={selectedContact}
            onExitChat={() => onSelectContact(null)}
            onSendMessage={onSendMessage}
            onDeleteMessage={onDeleteMessage}
          />
        </div>
      ) : (
        <div className={cn(
          "hidden lg:flex flex-col items-center justify-center bg-muted/30",
           isSidebarOpen ? 'lg:col-span-9' : 'lg:col-span-7'
        )}>
            <p className="text-muted-foreground">Select a contact to start chatting</p>
        </div>
      )}

      {/* Profile Panel */}
       {selectedContact && (
        <div className={cn(
            "hidden border-l",
            "lg:block",
             isSidebarOpen ? 'lg:col-span-3' : 'lg:col-span-3'
        )}>
          <ChatUserProfile contact={selectedContact} />
        </div>
       )}
    </div>
  );
}
