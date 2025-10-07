
'use client';

import { ChatContactList } from './chat-contact-list';
import { ChatMessages } from './chat-messages';
import { ChatUserProfile } from './chat-user-profile';
import { useChat } from '@/context/chat-context';
import type { Contact, Message } from '@/types/chat';
import { cn } from '@/lib/utils';
import { useSidebar } from '../layout/sidebar';
import { Sheet, SheetContent, SheetTitle } from '../ui/sheet';
import { useIsMobileOrTablet } from '@/hooks/use-mobile';


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
  const isMobileOrTablet = useIsMobileOrTablet();

  const getGridCols = () => {
    if (isProfileOpen && !isMobileOrTablet) {
      return 'lg:grid-cols-[minmax(280px,1.2fr)_minmax(0,3fr)_minmax(280px,1fr)]';
    }
    return 'lg:grid-cols-[minmax(280px,1.2fr)_minmax(0,3fr)]';
  }

  return (
    <div className={cn("grid h-full w-full transition-all duration-300", getGridCols())}>
      {/* Contact List */}
      <div
        className={cn(
          'border-r bg-background h-full flex-col',
          selectedContact && isMobileOrTablet ? 'hidden' : 'flex col-span-full lg:col-span-1',
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
         <div className={cn("flex-col h-full overflow-hidden", selectedContact ? 'flex col-span-full lg:col-span-1' : 'hidden')}>
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
      {selectedContact && isProfileOpen && !isMobileOrTablet && (
        <div className="hidden lg:flex flex-col h-full border-l bg-background">
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
