
'use client';

import React, { createContext, useState, useContext, ReactNode, useMemo } from 'react';
import type { Contact, Message } from '@/types/chat';

const USER_ID = 'patrick-achitabwino-m1';

const teamMembers: Contact[] = [
    { id: USER_ID, name: 'Patrick Achitabwino', role: 'Consultant', status: 'online' as const, lastMessage: 'On it!', lastMessageTime: '5m', unreadCount: 2, lastMessageReadStatus: 'read' },
    { id: 'frank-mhango-m2', name: 'Frank Mhango', role: 'Consultant', status: 'last seen today at 1:30 PM', lastMessage: 'See you tomorrow.', lastMessageTime: '1h', lastMessageReadStatus: 'delivered' },
    { id: 'denis-maluwasa-m3', name: 'Denis Maluwasa', role: 'Consultant', status: 'online' as const, lastMessage: 'I pushed the latest changes.', lastMessageTime: '20m', lastMessageReadStatus: 'sent' },
    { id: 'gift-banda-m4', name: 'Gift Banda', role: 'Consultant', status: 'online' as const, lastMessage: 'The mockups are ready for review.', lastMessageTime: '1h', lastMessageReadStatus: 'read' },
    { id: 'chiyanjano-mkandawire-m5', name: 'Chiyanjano Mkandawire', role: 'Consultant', status: 'last seen yesterday at 11:15 PM', lastMessage: 'I have a question about the new feature.', lastMessageTime: '3h', lastMessageReadStatus: 'delivered' },
    { id: 'wezi-chisale-m6', name: 'Wezi Chisale', role: 'Consultant', status: 'online' as const, lastMessage: 'The staging server is updated.', lastMessageTime: '10m', unreadCount: 1, lastMessageReadStatus: 'read' },
    { id: 'charity-moyo-m7', name: 'Charity Moyo', role: 'Consultant', status: 'last seen 2 days ago', lastMessage: 'Meeting at 3 PM.', lastMessageTime: '4h', lastMessageReadStatus: 'sent' },
    { id: 'fumbani-mwenefumbo-m8', name: 'Fumbani Mwenefumbo', role: 'Consultant', status: 'online' as const, lastMessage: 'The data analysis is complete.', lastMessageTime: '30m', lastMessageReadStatus: 'read' },
    { id: 'rose-kabudula-m9', name: 'Rose Kabudula', role: 'Consultant', status: 'online' as const, lastMessage: 'All set for the demo.', lastMessageTime: '15m', lastMessageReadStatus: 'read' },
];

const messagesData: Message[] = [
    { id: 'msg1', senderId: 'patrick-achitabwino-m1', recipientId: 'user', content: "Hey! Just wanted to check in on the progress for the new auth flow.", timestamp: "10:00 AM" },
    { id: 'msg2', senderId: 'user', recipientId: 'patrick-achitabwino-m1', content: "Hey Patrick, things are going well. I've finished the main logic and am now working on the UI.", timestamp: "10:01 AM", readStatus: 'read' },
    { id: 'msg3', senderId: 'patrick-achitabwino-m1', recipientId: 'user', content: "Great to hear! Let me know if you run into any blockers.", timestamp: "10:02 AM" },
    { id: 'msg4', senderId: 'user', recipientId: 'patrick-achitabwino-m1', content: "Will do. I might have a question about the token handling later today.", timestamp: "10:03 AM", readStatus: 'delivered' },
    { id: 'msg5', senderId: 'patrick-achitabwino-m1', recipientId: 'user', content: "Sure, feel free to ping me anytime.", timestamp: "10:04 AM" },
    { id: 'msg6', senderId: 'user', recipientId: 'patrick-achitabwino-m1', content: "Thanks!", timestamp: "10:05 AM", readStatus: 'sent' },
];

interface ChatContextType {
  contacts: Contact[];
  messages: Message[];
  unreadMessagesCount: number;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [allContacts] = useState<Contact[]>(teamMembers);
  const [messages, setMessages] = useState<Message[]>(messagesData);

  const contacts = useMemo(() => allContacts.filter(c => c.id !== USER_ID), [allContacts]);

  const unreadMessagesCount = contacts.reduce((count, contact) => count + (contact.unreadCount || 0), 0);

  const value = {
    contacts,
    messages,
    unreadMessagesCount,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
