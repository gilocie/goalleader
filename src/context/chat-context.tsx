
'use client';

import React, { createContext, useState, useContext, ReactNode, useMemo, Dispatch, SetStateAction, useCallback, useEffect } from 'react';
import type { Contact, Message } from '@/types/chat';
import { format } from 'date-fns';

const USER_ID = 'patrick-achitabwino-m1';

const teamMembers: Contact[] = [
    { id: 'patrick-achitabwino-m1', name: 'Patrick Achitabwino', role: 'Consultant', status: 'online' as const, lastMessage: 'On it!', lastMessageTime: '5m', unreadCount: 0, lastMessageReadStatus: 'read' },
    { id: 'frank-mhango-m2', name: 'Frank Mhango', role: 'Consultant', status: 'last seen today at 1:30 PM', lastMessage: 'See you tomorrow.', lastMessageTime: '1h', lastMessageReadStatus: 'delivered' },
    { id: 'denis-maluwasa-m3', name: 'Denis Maluwasa', role: 'Consultant', status: 'online' as const, lastMessage: 'I pushed the latest changes.', lastMessageTime: '20m', unreadCount: 1, lastMessageReadStatus: 'sent' },
    { id: 'gift-banda-m4', name: 'Gift Banda', role: 'Consultant', status: 'online' as const, lastMessage: 'The mockups are ready for review.', lastMessageTime: '1h', lastMessageReadStatus: 'read' },
    { id: 'chiyanjano-mkandawire-m5', name: 'Chiyanjano Mkandawire', role: 'Consultant', status: 'last seen yesterday at 11:15 PM', lastMessage: 'I have a question about the new feature.', lastMessageTime: '3h', lastMessageReadStatus: 'delivered' },
    { id: 'wezi-chisale-m6', name: 'Wezi Chisale', role: 'Consultant', status: 'online' as const, lastMessage: 'The staging server is updated.', lastMessageTime: '10m', unreadCount: 0, lastMessageReadStatus: 'read' },
    { id: 'charity-moyo-m7', name: 'Charity Moyo', role: 'Consultant', status: 'last seen 2 days ago', lastMessage: 'Meeting at 3 PM.', lastMessageTime: '4h', lastMessageReadStatus: 'sent' },
    { id: 'fumbani-mwenefumbo-m8', name: 'Fumbani Mwenefumbo', role: 'Consultant', status: 'online' as const, lastMessage: 'The data analysis is complete.', lastMessageTime: '30m', lastMessageReadStatus: 'read' },
    { id: 'rose-kabudula-m9', name: 'Rose Kabudula', role: 'Consultant', status: 'online' as const, lastMessage: 'All set for the demo.', lastMessageTime: '15m', lastMessageReadStatus: 'read' },
];

const messagesData: Message[] = [
    { id: 'msg1', senderId: 'frank-mhango-m2', recipientId: USER_ID, content: "Hey! Just wanted to check in on the progress for the new auth flow.", timestamp: "10:00 AM", type: 'text' },
    { id: 'msg2', senderId: USER_ID, recipientId: 'frank-mhango-m2', content: "Hey Frank, things are going well. I've finished the main logic and am now working on the UI.", timestamp: "10:01 AM", readStatus: 'read', type: 'text' },
    { id: 'msg3', senderId: 'frank-mhango-m2', recipientId: USER_ID, content: "Great to hear! Let me know if you run into any blockers.", timestamp: "10:02 AM", type: 'text' },
    { id: 'msg4', senderId: USER_ID, recipientId: 'frank-mhango-m2', content: "Will do. I might have a question about the token handling later today.", timestamp: "10:03 AM", readStatus: 'delivered', type: 'text' },
    { id: 'msg5', senderId: 'frank-mhango-m2', recipientId: USER_ID, content: "Sure, feel free to ping me anytime.", timestamp: "10:04 AM", type: 'text' },
    { id: 'msg6', senderId: USER_ID, recipientId: 'frank-mhango-m2', content: "Thanks!", timestamp: "10:05 AM", readStatus: 'sent', type: 'text' },
];

interface ChatContextType {
  self: Contact | undefined;
  contacts: Contact[];
  messages: Message[];
  unreadMessagesCount: number;
  selectedContact: Contact | null;
  setSelectedContact: Dispatch<SetStateAction<Contact | null>>;
  addMessage: (content: string, recipientId: string, type: 'text' | 'audio' | 'image' | 'file', data?: Partial<Message>) => void;
  deleteMessage: (messageId: string) => void;
  forwardMessage: (message: Message, recipientIds: string[]) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [allContacts, setAllContacts] = useState<Contact[]>(teamMembers);
  const [messages, setMessages] = useState<Message[]>(messagesData);
  
  const self = useMemo(() => allContacts.find(c => c.id === USER_ID), [allContacts]);
  const contacts = useMemo(() => allContacts.filter(c => c.id !== USER_ID), [allContacts]);
  
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const unreadMessagesCount = useMemo(() => contacts.reduce((count, contact) => count + (contact.unreadCount || 0), 0), [contacts]);

  const addMessage = useCallback((content: string, recipientId: string, type: 'text' | 'audio' | 'image' | 'file', data: Partial<Message> = {}) => {
    if (!self) return;
    const newMessage: Message = {
      id: `msg${Date.now()}`,
      senderId: self.id,
      recipientId,
      content,
      timestamp: format(new Date(), 'p'),
      readStatus: 'sent',
      type: type,
      ...data
    };
    setMessages(prev => [...prev, newMessage]);
    
    // Simulate recipient receiving and replying
    setTimeout(() => {
        // Mark as delivered
        setMessages(prev => prev.map(m => m.id === newMessage.id ? {...m, readStatus: 'delivered'} : m));
        setAllContacts(prev => prev.map(c => c.id === self.id ? {...c, lastMessageReadStatus: 'delivered'} : c));

        // Simulate a reply from the recipient
        const recipient = allContacts.find(c => c.id === recipientId);
        if (recipient) {
            let replyContent = `Thanks for the message! I've received: "${content.substring(0, 20)}..."`;
            if (type === 'image') replyContent = "Cool image!";
            if (type === 'file') replyContent = `Got the file: ${data.fileName}`;
            if (type === 'audio') replyContent = `Heard your voice note.`;


            const replyMessage: Message = {
                id: `msg${Date.now() + 1}`,
                senderId: recipientId,
                recipientId: self.id,
                content: replyContent,
                timestamp: format(new Date(), 'p'),
                type: 'text'
            };
            setMessages(prev => [...prev, replyMessage]);
            
            // Update contact list with new message and unread count
            setAllContacts(prev => prev.map(c => 
                c.id === recipientId 
                ? {
                    ...c, 
                    lastMessage: replyMessage.content, 
                    lastMessageTime: format(new Date(), 'p'),
                    unreadCount: (selectedContact?.id !== c.id) ? (c.unreadCount || 0) + 1 : c.unreadCount
                  } 
                : c
            ));
        }

    }, 2000);

    // After 3 seconds, simulate that the recipient read the message
    setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === newMessage.id ? {...m, readStatus: 'read'} : m));
      setAllContacts(prev => prev.map(c => c.id === self.id ? {...c, lastMessageReadStatus: 'read'} : c));
    }, 3000);

  }, [self, allContacts, selectedContact]);

  const deleteMessage = useCallback((messageId: string) => {
    setMessages(prev => prev.filter(m => m.id !== messageId));
  }, []);

  const forwardMessage = useCallback((message: Message, recipientIds: string[]) => {
    if (!self) return;

    recipientIds.forEach((recipientId, index) => {
        setTimeout(() => {
            const forwardedMessage: Message = {
                ...message,
                id: `fwd-${Date.now()}-${index}`,
                senderId: self.id,
                recipientId: recipientId,
                timestamp: format(new Date(), 'p'),
                readStatus: 'sent',
            };
            setMessages(prev => [...prev, forwardedMessage]);

             // Update contact list with new message and unread count
            setAllContacts(prev => prev.map(c => 
                c.id === recipientId 
                ? {
                    ...c, 
                    lastMessage: `Forwarded: ${message.content || message.type}`,
                    lastMessageTime: format(new Date(), 'p'),
                    unreadCount: (selectedContact?.id !== c.id) ? (c.unreadCount || 0) + 1 : c.unreadCount
                  } 
                : c
            ));
        }, index * 100); // Stagger sending
    });
  }, [self, selectedContact]);
  
  // Effect to mark messages as read when a chat is opened
  useEffect(() => {
    if (selectedContact) {
        // Mark messages as read in the main message list
        setMessages(prev => prev.map(m => 
            (m.senderId === selectedContact.id && m.recipientId === self?.id) 
            ? { ...m, readStatus: 'read' } 
            : m
        ));
        
        // Update unread count on the contact
        setAllContacts(prev => prev.map(c => 
            c.id === selectedContact.id ? { ...c, unreadCount: 0 } : c
        ));
    }
  }, [selectedContact, self?.id]);


  const value = {
    self,
    contacts: allContacts.filter(c => c.id !== USER_ID),
    messages,
    unreadMessagesCount,
    selectedContact,
    setSelectedContact,
    addMessage,
    deleteMessage,
    forwardMessage,
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
