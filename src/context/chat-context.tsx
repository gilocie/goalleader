
'use client';

import React, { createContext, useState, useContext, ReactNode, useMemo, Dispatch, SetStateAction, useCallback, useEffect } from 'react';
import type { Contact, Message } from '@/types/chat';
import { format } from 'date-fns';
import { useUser } from './user-context';

const teamMembers: Omit<Contact, 'lastMessage' | 'lastMessageTime' | 'unreadCount' | 'lastMessageReadStatus' | 'lastMessageSenderId'>[] = [
    { id: 'patrick-achitabwino-m1', name: 'Patrick Achitabwino', role: 'Consultant', status: 'online' as const },
    { id: 'frank-mhango-m2', name: 'Frank Mhango', role: 'Consultant', status: 'last seen today at 1:30 PM' },
    { id: 'denis-maluwasa-m3', name: 'Denis Maluwasa', role: 'Consultant', status: 'online' as const },
    { id: 'gift-banda-m4', name: 'Gift Banda', role: 'Consultant', status: 'online' as const },
    { id: 'chiyanjano-mkandawire-m5', name: 'Chiyanjano Mkandawire', role: 'Consultant', status: 'online' as const },
    { id: 'wezi-chisale-m6', name: 'Wezi Chisale', role: 'Consultant', status: 'online' as const },
    { id: 'charity-moyo-m7', name: 'Charity Moyo', role: 'Consultant', status: 'last seen 2 days ago' },
    { id: 'fumbani-mwenefumbo-m8', name: 'Fumbani Mwenefumbo', role: 'Consultant', status: 'online' as const },
    { id: 'rose-kabudula-m9', name: 'Rose Kabudula', role: 'Consultant', status: 'online' as const },
];

const GLOBAL_MESSAGES_KEY = 'global_chatMessages';
const GLOBAL_ACTIVE_CHATS_KEY = 'global_activeChatIds';


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
  const { user, getUserStatus } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [incomingCallFrom, setIncomingCallFrom] = useState<Contact | null>(null);
  const [acceptedCallContact, setAcceptedCallContact] = useState<Contact | null>(null);
  const [incomingVoiceCallFrom, setIncomingVoiceCallFrom] = useState<Contact | null>(null);
  const [acceptedVoiceCallContact, setAcceptedVoiceCallContact] = useState<Contact | null>(null);
  
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [activeChatIds, setActiveChatIds] = useState<Set<string>>(new Set());

  // Load from global storage
  useEffect(() => {
    try {
        const storedMessages = localStorage.getItem(GLOBAL_MESSAGES_KEY);
        if (storedMessages) {
            setMessages(JSON.parse(storedMessages));
        }
        const storedActiveChats = localStorage.getItem(GLOBAL_ACTIVE_CHATS_KEY);
        if (storedActiveChats) {
            setActiveChatIds(new Set(JSON.parse(storedActiveChats)));
        }
    } catch (error) {
        console.error("Failed to load global chat data from localStorage", error);
    }
  }, []);

  const allContacts = useMemo(() => {
    return teamMembers.map(member => {
        const relevantMessages = messages.filter(
            msg => (msg.senderId === member.id && msg.recipientId === user.id) ||
                   (msg.senderId === user.id && msg.recipientId === member.id)
        );
        const lastMessage = relevantMessages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
        
        // Unread count is messages sent by the other person that are not yet read by the current user
        const unreadCount = messages.filter(msg => msg.senderId === member.id && msg.recipientId === user.id && msg.readStatus !== 'read').length;

        return {
            ...member,
            status: getUserStatus(member.id),
            lastMessage: lastMessage?.isSystem ? 'Call' : lastMessage?.content || '',
            lastMessageTime: lastMessage ? format(new Date(lastMessage.timestamp), 'p') : '',
            unreadCount: selectedContact?.id === member.id ? 0 : unreadCount,
            lastMessageReadStatus: lastMessage?.senderId === user.id ? lastMessage.readStatus : undefined,
            lastMessageSenderId: lastMessage?.senderId,
        };
    });
  }, [messages, selectedContact, user.id, getUserStatus]);


  const self = useMemo(() => allContacts.find(c => c.id === user.id), [allContacts, user.id]);

  const updateActiveChatIds = (newIds: Set<string>) => {
    setActiveChatIds(newIds);
    try {
        localStorage.setItem(GLOBAL_ACTIVE_CHATS_KEY, JSON.stringify(Array.from(newIds)));
    } catch (error) {
        console.error("Failed to save active chats to localStorage", error);
    }
  }
  
  const contacts = useMemo(() => {
    const contactList = allContacts.filter(c => {
        if (c.id === user.id) return false;
        const chatId = [user.id, c.id].sort().join('--');
        return activeChatIds.has(chatId);
    });
    
    contactList.sort((a, b) => {
        const lastMessageA = messages.filter(m => (m.senderId === a.id && m.recipientId === user.id) || (m.senderId === user.id && m.recipientId === a.id)).sort((m1, m2) => new Date(m2.timestamp).getTime() - new Date(m1.timestamp).getTime())[0];
        const lastMessageB = messages.filter(m => (m.senderId === b.id && m.recipientId === user.id) || (m.senderId === user.id && m.recipientId === b.id)).sort((m1, m2) => new Date(m2.timestamp).getTime() - new Date(m1.timestamp).getTime())[0];
        if (!lastMessageA) return 1;
        if (!lastMessageB) return -1;
        return new Date(lastMessageB.timestamp).getTime() - new Date(lastMessageA.timestamp).getTime();
    });

    return contactList;
  }, [allContacts, activeChatIds, messages, user.id]);
  
  const unreadMessagesCount = useMemo(() => contacts.reduce((count, contact) => count + (contact.unreadCount || 0), 0), [contacts]);

  const updateMessages = (newMessages: Message[]) => {
      setMessages(newMessages);
      try {
          localStorage.setItem(GLOBAL_MESSAGES_KEY, JSON.stringify(newMessages));
      } catch (error) {
          console.error("Failed to save messages to localStorage", error);
      }
  }

  const addMessage = useCallback((content: string, recipientId: string, type: 'text' | 'audio' | 'image' | 'file', data: Partial<Message> = {}) => {
    if (!self) return;

    // A chat is identified by the two participants
    const participants = [self.id, recipientId].sort();
    const chatId = participants.join('--');

    const newMessage: Message = {
      id: `msg${Date.now()}-${Math.random()}`,
      senderId: self.id,
      recipientId,
      content,
      timestamp: new Date().toISOString(),
      readStatus: 'sent',
      type: type,
      ...data
    };
    
    updateMessages([...messages, newMessage]);
    updateActiveChatIds(new Set(activeChatIds).add(chatId));

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
        callType: type,
    };
    updateMessages(prev => [...prev, systemMessage]);
  }, [self, messages, updateMessages]);

  const deleteMessage = useCallback((messageId: string) => {
    const newMessages = messages.filter(m => m.id !== messageId);
    updateMessages(newMessages);
  }, [messages, updateMessages]);

  const clearChat = useCallback((contactId: string) => {
    const newMessages = messages.filter(
      msg => !((msg.senderId === contactId && msg.recipientId === self?.id) || (msg.senderId === self?.id && msg.recipientId === contactId))
    );
    updateMessages(newMessages);
  }, [self?.id, messages, updateMessages]);

  const deleteChat = useCallback((contactId: string) => {
    clearChat(contactId);
    if (self) {
        const participants = [self.id, contactId].sort();
        const chatId = participants.join('--');
        updateActiveChatIds(prev => {
            const newIds = new Set(prev);
            newIds.delete(chatId);
            return newIds;
        });
    }
  }, [clearChat, updateActiveChatIds, self]);

  const forwardMessage = useCallback((message: Message, recipientIds: string[]) => {
    if (!self) return;

    const newMessages: Message[] = [];
    const newActiveChatIds = new Set(activeChatIds);
    
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

        const participants = [self.id, recipientId].sort();
        const chatId = participants.join('--');
        newActiveChatIds.add(chatId);
    });

    updateMessages([...messages, ...newMessages]);
    updateActiveChatIds(newActiveChatIds);
  }, [self, messages, activeChatIds, updateMessages]);

  const startCall = useCallback((contact: Contact) => {
    setAcceptedCallContact(contact);
    addSystemMessage(`Calling ${contact.name}...`, contact.id, 'video');
  }, [addSystemMessage]);

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
    addSystemMessage(`Calling ${contact.name}...`, contact.id, 'voice');
  }, [addSystemMessage]);
  
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
  
  useEffect(() => {
    if (selectedContact && self) {
        const newMessages = messages.map(m => 
            (m.senderId === selectedContact.id && m.recipientId === self.id && m.readStatus !== 'read') 
            ? { ...m, readStatus: 'read' as const } 
            : m
        );
        if (newMessages.some((m, i) => m.readStatus !== messages[i].readStatus)) {
            updateMessages(newMessages);
        }

        const participants = [self.id, selectedContact.id].sort();
        const chatId = participants.join('--');
        if (!activeChatIds.has(chatId)) {
            updateActiveChatIds(new Set(activeChatIds).add(chatId));
        }
    }
  }, [selectedContact, self?.id, messages, activeChatIds]);


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
