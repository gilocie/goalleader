

'use client';

import { ChatContactList } from './chat-contact-list';
import { ChatMessages } from './chat-messages';
import { ChatUserProfile } from './chat-user-profile';
import { useChat } from '@/context/chat-context';
import type { Contact, Message } from '@/types/chat';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTitle } from '../ui/sheet';
import { useIsMobileOrTablet } from '@/hooks/use-mobile';
import { Logo } from '../icons';
import { useCallback } from 'react';

interface ChatLayoutProps {
  contacts: Contact[];
  messages: Message[];
  selectedContact: Contact | null;
  onSelectContact: (contact: Contact | null) => void;
  onSendMessage: (message: string, type: 'text' | 'audio' | 'image' | 'file', data?: any) => void;
  onDeleteMessage: (messageId: string, deleteForEveryone: boolean) => void;
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
  const isMobileOrTablet = useIsMobileOrTablet();

  const handleExitChat = useCallback(() => {
    onSelectContact(null);
  }, [onSelectContact]);

  const getGridCols = () => {
    if (isProfileOpen && !isMobileOrTablet) {
      return 'lg:grid-cols-[minmax(280px,1.2fr)_minmax(0,3fr)_minmax(280px,1fr)]';
    }
    return 'grid-cols-1 lg:grid-cols-[minmax(280px,1.2fr)_minmax(0,3fr)]';
  }

  return (
    <div className={cn("grid h-full w-full overflow-hidden transition-all duration-300", getGridCols())}>
      {/* Contact List */}
      <div
        className={cn(
          'border-r bg-background overflow-hidden h-full',
          selectedContact && isMobileOrTablet ? 'hidden' : 'flex flex-col'
        )}
      >
        <ChatContactList
          contacts={contacts}
          onSelectContact={onSelectContact}
          selectedContactId={selectedContact?.id}
        />
      </div>

      {/* Main Chat Area */}
      <div className={cn("overflow-hidden h-full", !isMobileOrTablet || (isMobileOrTablet && selectedContact) ? 'flex flex-col' : 'hidden lg:flex')}>
        {selectedContact && self ? (
          <ChatMessages
            messages={messages}
            selectedContact={selectedContact}
            onExitChat={handleExitChat}
            onSendMessage={onSendMessage}
            onDeleteMessage={onDeleteMessage}
            onToggleProfile={onToggleProfile}
          />
        ) : (
          <div className="flex-col items-center justify-center bg-muted/30 h-full hidden lg:flex text-center p-4">
            <Logo className="h-20 w-20 text-primary/20 mb-4" />
            <p className="text-muted-foreground text-lg">Select a contact to start chatting</p>
            <p className="text-muted-foreground text-sm">or start a new conversation.</p>
          </div>
        )}
      </div>

      {/* Profile Panel */}
      {selectedContact && isProfileOpen && !isMobileOrTablet && (
        <div className="hidden lg:flex flex-col h-full border-l bg-background overflow-hidden">
          <ChatUserProfile contact={selectedContact} />
        </div>
      )}

      {/* Profile Sheet for mobile/tablet */}
      {selectedContact && isMobileOrTablet && (
         <Sheet open={isProfileOpen} onOpenChange={onToggleProfile}>
            <SheetContent className="p-0 w-full max-w-sm">
                <SheetTitle className="sr-only">Contact Profile</SheetTitle>
                <ChatUserProfile contact={selectedContact} />
            </SheetContent>
         </Sheet>
      )}
    </div>
  );
}
