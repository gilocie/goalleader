
'use client';

import { ChatContactList } from './chat-contact-list';
import { ChatMessages } from './chat-messages';
import { ChatUserProfile } from './chat-user-profile';
import { Contact, Message } from '@/types/chat';

interface ChatLayoutProps {
  contacts: Contact[];
  messages: Message[];
  selectedContact: Contact | null;
  onSelectContact: (contact: Contact | null) => void;
}

export function ChatLayout({ contacts, messages, selectedContact, onSelectContact }: ChatLayoutProps) {

  if (selectedContact) {
    return (
      <div className="h-full w-full">
        <ChatMessages 
          messages={messages} 
          selectedContact={selectedContact} 
          onExitChat={() => onSelectContact(null)}
          isFullScreen={true}
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-10 h-full w-full">
      <div className="col-span-10 md:col-span-3 lg:col-span-2 border-r">
        <ChatContactList 
          contacts={contacts} 
          onSelectContact={onSelectContact}
        />
      </div>
      <div className="col-span-10 md:col-span-7 lg:col-span-5 hidden md:flex flex-col">
        {/* Placeholder for when no chat is selected */}
        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
          <p className="text-lg font-medium">Select a contact to start chatting</p>
          <p className="text-sm">Your conversations will appear here.</p>
        </div>
      </div>
      <div className="col-span-10 lg:col-span-3 border-l hidden lg:flex flex-col">
        {/* Placeholder for user profile */}
        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <p className="text-lg font-medium">User Profile</p>
            <p className="text-sm">Contact details will show up here.</p>
        </div>
      </div>
    </div>
  );
}
