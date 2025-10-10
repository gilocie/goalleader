
'use client';

import React, { createContext, useState, useContext, ReactNode, useMemo, Dispatch, SetStateAction, useCallback, useEffect } from 'react';
import type { Contact, Message } from '@/types/chat';
import { format } from 'date-fns';
import { useUser } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, deleteDoc, doc, updateDoc, where } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useCollection, useDoc } from '@/firebase';
import { useUser as useUserContext } from './user-context';

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
  const { user: firebaseUser } = useUser(); // Firebase user
  const { allTeamMembers } = useUserContext();
  const firestore = useFirestore();
  
  const messagesSentQuery = useMemo(() => {
    if (!firestore || !firebaseUser) return null;
    return query(collection(firestore, 'messages'), where('senderId', '==', firebaseUser.uid));
  }, [firestore, firebaseUser]);

  const messagesReceivedQuery = useMemo(() => {
    if (!firestore || !firebaseUser) return null;
    return query(collection(firestore, 'messages'), where('recipientId', '==', firebaseUser.uid));
  }, [firestore, firebaseUser]);

  const { data: sentMessages } = useCollection<Message>(messagesSentQuery);
  const { data: receivedMessages } = useCollection<Message>(messagesReceivedQuery);
  
  const messages = useMemo(() => {
    const allMessages = [...sentMessages, ...receivedMessages];
    // Deduplicate and sort
    const uniqueMessages = Array.from(new Map(allMessages.map(m => [m.id, m])).values());
    return uniqueMessages.sort((a,b) => (a.timestamp?.toMillis() || 0) - (b.timestamp?.toMillis() || 0));
  }, [sentMessages, receivedMessages]);


  const { data: activeChatsData } = useDoc<{ ids: string[] }>(firestore ? doc(firestore, 'chats', 'active') : null);

  const [isTyping, setIsTyping] = useState(false);
  const [incomingCallFrom, setIncomingCallFrom] = useState<Contact | null>(null);
  const [acceptedCallContact, setAcceptedCallContact] = useState<Contact | null>(null);
  const [incomingVoiceCallFrom, setIncomingVoiceCallFrom] = useState<Contact | null>(null);
  const [acceptedVoiceCallContact, setAcceptedVoiceCallContact] = useState<Contact | null>(null);
  
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const activeChatIds = useMemo(() => new Set(activeChatsData?.ids || []), [activeChatsData]);

  const allContacts = useMemo(() => {
    if (!firebaseUser || !allTeamMembers) return [];
    return allTeamMembers.map(member => {
        const relevantMessages = messages.filter(
            msg => (msg.senderId === member.id && msg.recipientId === firebaseUser.uid) ||
                   (msg.senderId === firebaseUser.uid && msg.recipientId === member.id)
        );
        const lastMessage = relevantMessages.sort((a, b) => {
            const timeA = a.timestamp?.toMillis() || 0;
            const timeB = b.timestamp?.toMillis() || 0;
            return timeB - timeA;
        })[0];
        
        const unreadCount = messages.filter(msg => msg.senderId === member.id && msg.recipientId === firebaseUser.uid && msg.readStatus !== 'read').length;

        return {
            ...member,
            status: member.status || 'offline',
            lastMessage: lastMessage?.isSystem ? 'Call' : lastMessage?.content || '',
            lastMessageTime: lastMessage?.timestamp ? format(lastMessage.timestamp.toDate(), 'p') : '',
            unreadCount: selectedContact?.id === member.id ? 0 : unreadCount,
            lastMessageReadStatus: lastMessage?.senderId === firebaseUser.uid ? lastMessage.readStatus : undefined,
            lastMessageSenderId: lastMessage?.senderId,
        };
    });
  }, [messages, selectedContact, firebaseUser, allTeamMembers]);


  const self = useMemo(() => {
      if (!firebaseUser) return undefined;
      const selfInList = allContacts.find(c => c.id === firebaseUser.uid);
      if (selfInList) return selfInList;

      // Fallback if not in team members list (e.g. new anonymous user)
      return {
          id: firebaseUser.uid,
          name: firebaseUser.isAnonymous ? 'Guest User' : (firebaseUser.displayName || 'You'),
          role: 'Consultant',
          status: 'online',
          department: 'Customer Service'
      }
  }, [allContacts, firebaseUser]);

  const updateActiveChatIds = async (newIds: Set<string>) => {
    if (!firestore) return;
    const activeChatsRef = doc(firestore, 'chats', 'active');
    try {
        await updateDoc(activeChatsRef, { ids: Array.from(newIds) });
    } catch (e) {
        console.error("Failed to update active chats in Firestore", e);
    }
  }
  
  const contacts = useMemo(() => {
    if (!firebaseUser) return [];
    const contactList = allContacts.filter(c => {
        if (c.id === firebaseUser.uid) return false;
        const chatId = [firebaseUser.uid, c.id].sort().join('--');
        return activeChatIds.has(chatId);
    });
    
    contactList.sort((a, b) => {
        if (!firebaseUser) return 0;
        const lastMessageA = messages.filter(m => (m.senderId === a.id && m.recipientId === firebaseUser.uid) || (m.senderId === firebaseUser.uid && m.recipientId === a.id)).sort((m1, m2) => (m2.timestamp?.toMillis() || 0) - (m1.timestamp?.toMillis() || 0))[0];
        const lastMessageB = messages.filter(m => (m.senderId === b.id && m.recipientId === firebaseUser.uid) || (m.senderId === firebaseUser.uid && m.recipientId === b.id)).sort((m1, m2) => (m2.timestamp?.toMillis() || 0) - (m1.timestamp?.toMillis() || 0))[0];
        if (!lastMessageA) return 1;
        if (!lastMessageB) return -1;
        return (lastMessageB.timestamp?.toMillis() || 0) - (lastMessageA.timestamp?.toMillis() || 0);
    });

    return contactList;
  }, [allContacts, activeChatIds, messages, firebaseUser]);
  
  const unreadMessagesCount = useMemo(() => contacts.reduce((count, contact) => count + (contact.unreadCount || 0), 0), [contacts]);


  const addMessage = useCallback(async (content: string, recipientId: string, type: 'text' | 'audio' | 'image' | 'file', data: Partial<Message> = {}) => {
    if (!self || !firestore) return;

    const participants = [self.id, recipientId].sort();
    const chatId = participants.join('--');
    
    const messagesCollection = collection(firestore, 'messages');

    const newMessage: Omit<Message, 'id' | 'timestamp'> = {
      senderId: self.id,
      recipientId,
      content,
      readStatus: 'sent',
      type: type,
      ...data
    };
    
    addDoc(messagesCollection, {
        ...newMessage,
        timestamp: serverTimestamp()
    }).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: messagesCollection.path,
            operation: 'create',
            requestResourceData: newMessage,
        });
        errorEmitter.emit('permission-error', permissionError);
    });

    if (!activeChatIds.has(chatId)) {
        await updateActiveChatIds(new Set(activeChatIds).add(chatId));
    }
  }, [self, firestore, activeChatIds]);

  const addSystemMessage = useCallback(async (content: string, contactId: string, type: 'video' | 'voice' = 'video') => {
    if (!self || !firestore) return;
    const systemMessage = {
        senderId: self.id,
        recipientId: contactId,
        content: content,
        type: 'text' as const,
        isSystem: true,
        callType: type,
    };
    await addDoc(collection(firestore, 'messages'), {
        ...systemMessage,
        timestamp: serverTimestamp()
    });
  }, [self, firestore]);

  const deleteMessage = useCallback(async (messageId: string) => {
    if (!firestore) return;
    const messageRef = doc(firestore, 'messages', messageId);
    deleteDoc(messageRef).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: messageRef.path,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  }, [firestore]);

  const clearChat = useCallback(async (contactId: string) => {
    if (!self || !firestore) return;
    const chatMessages = messages.filter(
      msg => ((msg.senderId === contactId && msg.recipientId === self.id) || (msg.senderId === self.id && msg.recipientId === contactId))
    );
    for (const msg of chatMessages) {
      await deleteDoc(doc(firestore, 'messages', msg.id));
    }
  }, [self, firestore, messages]);

  const deleteChat = useCallback(async (contactId: string) => {
    await clearChat(contactId);
    if (self) {
        const participants = [self.id, contactId].sort();
        const chatId = participants.join('--');
        const newIds = new Set(activeChatIds);
        newIds.delete(chatId);
        await updateActiveChatIds(newIds);
    }
  }, [clearChat, self, activeChatIds]);

  const forwardMessage = useCallback(async (message: Message, recipientIds: string[]) => {
    if (!self || !firestore) return;
    
    for (const recipientId of recipientIds) {
        const participants = [self.id, recipientId].sort();
        const chatId = participants.join('--');
        if (!activeChatIds.has(chatId)) {
            await updateActiveChatIds(new Set(activeChatIds).add(chatId));
        }

        const forwardedMessage = {
            ...message,
            senderId: self.id,
            recipientId: recipientId,
            readStatus: 'sent' as const,
        };
        delete forwardedMessage.id;
        delete forwardedMessage.timestamp;

        await addDoc(collection(firestore, 'messages'), {
            ...forwardedMessage,
            timestamp: serverTimestamp()
        });
    }
  }, [self, firestore, activeChatIds]);

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
    if (selectedContact && self && firestore) {
        messages.forEach(async (m) => {
            if (m.senderId === selectedContact.id && m.recipientId === self.id && m.readStatus !== 'read') {
                const messageRef = doc(firestore, 'messages', m.id);
                const updateData = { readStatus: 'read' };
                updateDoc(messageRef, updateData).catch(async (serverError) => {
                    const permissionError = new FirestorePermissionError({
                        path: messageRef.path,
                        operation: 'update',
                        requestResourceData: updateData,
                    });
                    errorEmitter.emit('permission-error', permissionError);
                });
            }
        });
    }
  }, [selectedContact, self, messages, firestore]);


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
