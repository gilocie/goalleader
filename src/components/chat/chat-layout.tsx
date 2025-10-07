
'use client';

import { ChatContactList } from './chat-contact-list';
import { ChatMessages } from './chat-messages';
import { ChatUserProfile } from './chat-user-profile';
import { useChat } from '@/context/chat-context';
import type { Contact, Message } from '@/types/chat';
import { cn } from '@/lib/utils';
import { useSidebar } from '../layout/sidebar';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { User } from 'lucide-react';
import { Button } from '../ui/button';

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
  
  const gridColsClass = isSidebarOpen ? 'lg:grid-cols-[3fr,7fr]' : 'lg:grid-cols-[1fr,4fr]';

  return (
    <div className={cn("grid h-full w-full", gridColsClass)}>
      {/* Contact List */}
      <div
        className={cn(
          'border-r bg-background h-full flex flex-col',
          // On mobile, hide if a contact is selected.
          // On desktop, always show and define column span.
          selectedContact ? 'hidden lg:flex' : 'col-span-full'
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
         <div className="col-span-full lg:col-span-1 flex flex-col h-full">
           <ChatMessages
            messages={messages}
            selectedContact={selectedContact}
            onExitChat={() => onSelectContact(null)}
            onSendMessage={onSendMessage}
            onDeleteMessage={onDeleteMessage}
          >
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon">
                        <User className="h-4 w-4" />
                    </Button>
                </SheetTrigger>
                <SheetContent className="p-0">
                    <ChatUserProfile contact={selectedContact} />
                </SheetContent>
            </Sheet>
          </ChatMessages>
        </div>
      ) : (
        <div className="hidden lg:flex flex-col items-center justify-center bg-muted/30 h-full">
            <p className="text-muted-foreground text-lg">Select a contact to start chatting</p>
        </div>
      )}
    </div>
  );
}
