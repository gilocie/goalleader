
'use client';

import React, { createContext, useState, useContext, ReactNode, useMemo, Dispatch, SetStateAction, useCallback, useEffect } from 'react';
import type { Contact, Message } from '@/types/chat';
import { format } from 'date-fns';

const USER_ID = 'patrick-achitabwino-m1';

const teamMembers: Omit<Contact, 'lastMessage' | 'lastMessageTime' | 'unreadCount' | 'lastMessageReadStatus' | 'lastMessageSenderId'>[] = [
    { id: 'patrick-achitabwino-m1', name: 'Patrick Achitabwino', role: 'Consultant', status: 'online' as const },
    { id: 'frank-mhango-m2', name: 'Frank Mhango', role: 'Consultant', status: 'last seen today at 1:30 PM' },
    { id: 'denis-maluwasa-m3', name: 'Denis Maluwasa', role: 'Consultant', status: 'online' as const },
    { id: 'gift-banda-m4', name: 'Gift Banda', role: 'Consultant', status: 'online' as const },
    { id: 'chiyanjano-mkandawire-m5', name: 'Chiyanjano Mkandawire', role: 'Consultant', status: 'last seen yesterday at 11:15 PM' },
    { id: 'wezi-chisale-m6', name: 'Wezi Chisale', role: 'Consultant', status: 'online' as const },
    { id: 'charity-moyo-m7', name: 'Charity Moyo', role: 'Consultant', status: 'last seen 2 days ago' },
    { id: 'fumbani-mwenefumbo-m8', name: 'Fumbani Mwenefumbo', role: 'Consultant', status: 'online' as const },
    { id: 'rose-kabudula-m9', name: 'Rose Kabudula', role: 'Consultant', status: 'online' as const },
];

interface ChatContextType {
  self: Contact | undefined;
  contacts: Contact[];
  allContacts: Contact[];
  messages: Message[];
  unreadMessagesCount: number;
  selectedContact: Contact | null;
  setSelectedContact: Dispatch<SetStateAction<Contact | null>>;
  addMessage: (content: string, recipientId: string, type: 'text' | 'audio' | 'image' | 'file', data?: Partial<Message>) => void;
  deleteMessage: (messageId: string) => void;
  clearChat: (contactId: string) => void;
  deleteChat: (contactId: string) => void;
  forwardMessage: (message: Message, recipientIds: string[]) => void;
  isTyping: boolean;
  incomingCallFrom: Contact | null;
  startCall: (contact: Contact) => void;
  endCall: (contactId: string) => void;
  acceptCall: () => void;
  declineCall: () => void;
  acceptedCallContact: Contact | null;
  setAcceptedCallContact: Dispatch<SetStateAction<Contact | null>>;
  incomingVoiceCallFrom: Contact | null;
  startVoiceCall: (contact: Contact) => void;
  endVoiceCall: (contactId: string) => void;
  acceptVoiceCall: () => void;
  declineVoiceCall: () => void;
  acceptedVoiceCallContact: Contact | null;
  setAcceptedVoiceCallContact: Dispatch<SetStateAction<Contact | null>>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [incomingCallFrom, setIncomingCallFrom] = useState<Contact | null>(null);
  const [acceptedCallContact, setAcceptedCallContact] = useState<Contact | null>(null);
  const [incomingVoiceCallFrom, setIncomingVoiceCallFrom] = useState<Contact | null>(null);
  const [acceptedVoiceCallContact, setAcceptedVoiceCallContact] = useState<Contact | null>(null);
  
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [activeChatIds, setActiveChatIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
        const storedIds = localStorage.getItem('activeChatIds');
        if (storedIds) {
            setActiveChatIds(new Set(JSON.parse(storedIds)));
        }
        const storedMessages = localStorage.getItem('chatMessages');
        if (storedMessages) {
            setMessages(JSON.parse(storedMessages));
        }
    } catch (error) {
        console.error("Failed to load data from localStorage", error);
    }
  }, []);

  const allContacts = useMemo(() => {
    return teamMembers.map(member => {
        const relevantMessages = messages.filter(
            msg => (msg.senderId === member.id && msg.recipientId === USER_ID) ||
                   (msg.senderId === USER_ID && msg.recipientId === member.id)
        );
        const lastMessage = relevantMessages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
        const unreadCount = relevantMessages.filter(msg => msg.senderId === member.id && msg.readStatus !== 'read').length;

        return {
            ...member,
            lastMessage: lastMessage?.content || '',
            lastMessageTime: lastMessage ? format(new Date(lastMessage.timestamp), 'p') : '',
            unreadCount: selectedContact?.id === member.id ? 0 : unreadCount,
            lastMessageReadStatus: lastMessage?.senderId === USER_ID ? lastMessage.readStatus : undefined,
            lastMessageSenderId: lastMessage?.senderId,
        };
    });
  }, [messages, selectedContact]);

  const self = useMemo(() => allContacts.find(c => c.id === USER_ID), [allContacts]);

  const updateActiveChatIds = (newIds: Set<string>) => {
    setActiveChatIds(newIds);
    try {
        localStorage.setItem('activeChatIds', JSON.stringify(Array.from(newIds)));
    } catch (error) {
        console.error("Failed to save active chats to localStorage", error);
    }
  }

  const contacts = useMemo(() => {
    const contactList = allContacts.filter(c => c.id !== USER_ID && activeChatIds.has(c.id));
    // If a contact is selected but has no messages yet, add them to the list.
    if (selectedContact && !contactList.some(c => c.id === selectedContact.id)) {
        const contactData = allContacts.find(c => c.id === selectedContact.id);
        if (contactData) {
            return [contactData, ...contactList];
        }
    }
    return contactList.sort((a, b) => {
        const lastMessageA = messages.filter(m => m.senderId === a.id || m.recipientId === a.id).sort((m1, m2) => new Date(m2.timestamp).getTime() - new Date(m1.timestamp).getTime())[0];
        const lastMessageB = messages.filter(m => m.senderId === b.id || m.recipientId === b.id).sort((m1, m2) => new Date(m2.timestamp).getTime() - new Date(m1.timestamp).getTime())[0];
        if (!lastMessageA) return 1;
        if (!lastMessageB) return -1;
        return new Date(lastMessageB.timestamp).getTime() - new Date(lastMessageA.timestamp).getTime();
    });
  }, [allContacts, activeChatIds, selectedContact, messages]);
  
  const unreadMessagesCount = useMemo(() => contacts.reduce((count, contact) => count + (contact.unreadCount || 0), 0), [contacts]);

  const updateMessages = (newMessages: Message[]) => {
      setMessages(newMessages);
      try {
          localStorage.setItem('chatMessages', JSON.stringify(newMessages));
      } catch (error) {
          console.error("Failed to save messages to localStorage", error);
      }
  }

  const addMessage = useCallback((content: string, recipientId: string, type: 'text' | 'audio' | 'image' | 'file', data: Partial<Message> = {}) => {
    if (!self) return;

    const existingChat = messages.some(m => (m.senderId === recipientId && m.recipientId === self.id) || (m.senderId === self.id && m.recipientId === recipientId));

    const newMessage: Message = {
      id: `msg${Date.now()}-${Math.random()}`,
      senderId: self.id,
      recipientId,
      content,
      timestamp: new Date().toISOString(),
      readStatus: !existingChat ? 'request_sent' : 'sent',
      type: type,
      ...data
    };
    
    updateMessages([...messages, newMessage]);
    updateActiveChatIds(new Set(activeChatIds).add(recipientId));

  }, [self, messages, activeChatIds]);

  const addSystemMessage = useCallback((content: string, contactId: string, type: 'video' | 'voice' = 'video') => {
    if (!self) return;
    const systemMessage: Message = {
        id: `sys-${Date.now()}-${contactId}`,
        senderId: self.id,
        recipientId: contactId,
        content: content,
        timestamp: new Date().toISOString(),
        type: 'text',
        isSystem: true,
    };
    updateMessages([...messages, systemMessage]);
  }, [self, messages]);

  const deleteMessage = useCallback((messageId: string) => {
    const newMessages = messages.filter(m => m.id !== messageId);
    updateMessages(newMessages);
  }, [messages]);

  const clearChat = useCallback((contactId: string) => {
    const newMessages = messages.filter(
      msg => !((msg.senderId === contactId && msg.recipientId === self?.id) || (msg.senderId === self?.id && msg.recipientId === contactId))
    );
    updateMessages(newMessages);
  }, [self?.id, messages]);

  const deleteChat = useCallback((contactId: string) => {
    clearChat(contactId);
    updateActiveChatIds(prev => {
        const newIds = new Set(prev);
        newIds.delete(contactId);
        return newIds;
    });
  }, [clearChat]);

  const forwardMessage = useCallback((message: Message, recipientIds: string[]) => {
    if (!self) return;

    const newMessages: Message[] = [];
    recipientIds.forEach((recipientId, index) => {
        const forwardedMessage: Message = {
            ...message,
            id: `fwd-${Date.now()}-${index}-${Math.random()}`,
            senderId: self.id,
            recipientId: recipientId,
            timestamp: new Date().toISOString(),
            readStatus: 'sent',
        };
        newMessages.push(forwardedMessage);
    });
    updateMessages([...messages, ...newMessages]);
  }, [self, messages]);

  const startCall = useCallback((contact: Contact) => {
    setAcceptedCallContact(contact);
  }, []);

  const endCall = useCallback((contactId: string) => {
        addSystemMessage(`Video call ended`, contactId, 'video');
        setAcceptedCallContact(null);
  }, [addSystemMessage]);

  const acceptCall = useCallback(() => {
    if (incomingCallFrom) {
        addSystemMessage(`Video call with ${incomingCallFrom.name} started`, incomingCallFrom.id, 'video');
        setAcceptedCallContact(incomingCallFrom);
        setIncomingCallFrom(null);
    }
  }, [incomingCallFrom, addSystemMessage]);

  const declineCall = useCallback(() => {
    if (incomingCallFrom) {
        addSystemMessage(`Missed video call from ${incomingCallFrom.name}`, incomingCallFrom.id, 'video');
        setIncomingCallFrom(null);
    }
  }, [incomingCallFrom, addSystemMessage]);

  const startVoiceCall = useCallback((contact: Contact) => {
    setAcceptedVoiceCallContact(contact);
  }, []);
  
  const endVoiceCall = useCallback((contactId: string) => {
    addSystemMessage(`Voice call ended`, contactId, 'voice');
    setAcceptedVoiceCallContact(null);
  }, [addSystemMessage]);
  
  const acceptVoiceCall = useCallback(() => {
    if (incomingVoiceCallFrom) {
      addSystemMessage(`Voice call with ${incomingVoiceCallFrom.name} started`, incomingVoiceCallFrom.id, 'voice');
      setAcceptedVoiceCallContact(incomingVoiceCallFrom);
      setIncomingVoiceCallFrom(null);
    }
  }, [incomingVoiceCallFrom, addSystemMessage]);
  
  const declineVoiceCall = useCallback(() => {
    if (incomingVoiceCallFrom) {
      addSystemMessage(`Missed voice call from ${incomingVoiceCallFrom.name}`, incomingVoiceCallFrom.id, 'voice');
      setIncomingVoiceCallFrom(null);
    }
  }, [incomingVoiceCallFrom, addSystemMessage]);
  
  // Effect to mark messages as read when a chat is opened
  useEffect(() => {
    if (selectedContact && self) {
        const newMessages = messages.map(m => 
            (m.senderId === selectedContact.id && m.recipientId === self.id) 
            ? { ...m, readStatus: 'read' as const } 
            : m
        );
        updateMessages(newMessages);
        
        // Ensure the new chat is active
        if (!activeChatIds.has(selectedContact.id)) {
            updateActiveChatIds(new Set(activeChatIds).add(selectedContact.id));
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedContact, self?.id]);


  const value = {
    self,
    contacts,
    allContacts,
    messages,
    unreadMessagesCount,
    selectedContact,
    setSelectedContact,
    addMessage,
    deleteMessage,
    clearChat,
    deleteChat,
    forwardMessage,
    isTyping,
    incomingCallFrom,
    startCall,
    endCall,
    acceptCall,
    declineCall,
    acceptedCallContact,
    setAcceptedCallContact,
    incomingVoiceCallFrom,
    startVoiceCall,
    endVoiceCall,
    acceptVoiceCall,
    declineVoiceCall,
    acceptedVoiceCallContact,
    setAcceptedVoiceCallContact,
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
