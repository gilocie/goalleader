
'use client';

import { ChatContactList } from './chat-contact-list';
import { ChatMessages } from './chat-messages';
import { ChatUserProfile } from './chat-user-profile';
import { Contact, Message } from '@/types/chat';

interface ChatLayoutProps {
  contacts: Contact[];
  messages: Message[];
  selectedContact: Contact;
}

export function ChatLayout({ contacts, messages, selectedContact }: ChatLayoutProps) {
  return (
    <div className="grid grid-cols-10 h-full w-full">
      <div className="col-span-10 md:col-span-3 lg:col-span-2 border-r">
        <ChatContactList contacts={contacts} selectedContactId={selectedContact.id} />
      </div>
      <div className="col-span-10 md:col-span-7 lg:col-span-5 hidden md:flex flex-col">
        <ChatMessages messages={messages} selectedContact={selectedContact} />
      </div>
      <div className="col-span-10 lg:col-span-3 border-l hidden lg:flex flex-col">
        <ChatUserProfile contact={selectedContact} />
      </div>
    </div>
  );
}
