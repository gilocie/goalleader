
'use client';

import React, { createContext, useState, useContext, ReactNode, useMemo, Dispatch, SetStateAction, useCallback, useEffect } from 'react';
import type { Contact, Message } from '@/types/chat';
import { format } from 'date-fns';
import { useUser } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, deleteDoc, doc, updateDoc, where, writeBatch } from 'firebase/firestore';
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

  const { data: sentMessages, setData: setSentMessages } = useCollection<Message>(messagesSentQuery);
  const { data: receivedMessages, setData: setReceivedMessages } = useCollection<Message>(messagesReceivedQuery);
  
  const messages = useMemo(() => {
    const allMessages = [...sentMessages, ...receivedMessages];
    // Deduplicate and sort
    const uniqueMessages = Array.from(new Map(allMessages.map(m => [m.id, m])).values());
    return uniqueMessages.sort((a,b) => (a.timestamp?.toMillis() || 0) - (b.timestamp?.toMillis() || 0));
  }, [sentMessages, receivedMessages]);


  const { data: activeChatsData } = useDoc<{ ids: string[] }>(firestore && firebaseUser ? doc(firestore, 'chats', firebaseUser.uid) : null);

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
    if (!firestore || !firebaseUser) return;
    const activeChatsRef = doc(firestore, 'chats', firebaseUser.uid);
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
        // A chat is "active" if there are any messages between the two users.
        const hasMessages = messages.some(m => 
            (m.senderId === c.id && m.recipientId === firebaseUser.uid) || 
            (m.senderId === firebaseUser.uid && m.recipientId === c.id)
        );
        return hasMessages;
    });
    
    contactList.sort((a, b) => {
        if (!firebaseUser) return 0;
        const lastMessageA = messages.filter(m => (m.senderId === a.id && m.recipientId === firebaseUser.uid) || (m.senderId === firebaseUser.uid && m.recipientId === a.id)).sort((m1, m2) => (m2.timestamp?.toMillis() || 0) - (m1.timestamp?.toMillis() || 0))[0];
        const lastMessageB = messages.filter(m => (m.senderId === b.id && m.recipientId === firebaseUser.uid) || (m.senderId === firebaseUser.uid && m.recipientId === b.id)).sort((m1, m2) => (m1.timestamp?.toMillis() || 0) - (m2.timestamp?.toMillis() || 0))[0];
        if (!lastMessageA) return 1;
        if (!lastMessageB) return -1;
        return (lastMessageB.timestamp?.toMillis() || 0) - (lastMessageA.timestamp?.toMillis() || 0);
    });

    return contactList;
  }, [allContacts, messages, firebaseUser]);
  
  const unreadMessagesCount = useMemo(() => contacts.reduce((count, contact) => count + (contact.unreadCount || 0), 0), [contacts]);


  const addMessage = useCallback(async (content: string, recipientId: string, type: 'text' | 'audio' | 'image' | 'file', data: Partial<Message> = {}) => {
    if (!self || !firestore) return;
    
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
            requestResourceData: {...newMessage, timestamp: new Date().toISOString() }, // Add a client-side timestamp for the error report
        });
        errorEmitter.emit('permission-error', permissionError);
    });

  }, [self, firestore]);

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
    setSentMessages(prev => prev.filter(m => m.id !== messageId));
    setReceivedMessages(prev => prev.filter(m => m.id !== messageId));
    deleteDoc(messageRef).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: messageRef.path,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  }, [firestore, setSentMessages, setReceivedMessages]);

  const clearChat = useCallback(async (contactId: string) => {
    if (!self || !firestore) return;
    
    const chatMessagesToDelete = messages.filter(
      msg => ((msg.senderId === contactId && msg.recipientId === self.id) || (msg.senderId === self.id && msg.recipientId === contactId))
    );

    const batch = writeBatch(firestore);
    chatMessagesToDelete.forEach(msg => {
      batch.delete(doc(firestore, 'messages', msg.id));
    });
    await batch.commit();
    
    // Optimistically update UI
    const remainingSent = sentMessages.filter(m => !(m.recipientId === contactId || m.senderId === contactId));
    const remainingReceived = receivedMessages.filter(m => !(m.recipientId === contactId || m.senderId === contactId));
    setSentMessages(remainingSent);
    setReceivedMessages(remainingReceived);

  }, [self, firestore, messages, sentMessages, receivedMessages, setSentMessages, setReceivedMessages]);

  const deleteChat = useCallback(async (contactId: string) => {
    await clearChat(contactId);
    if (self) {
        setSelectedContact(null);
    }
  }, [clearChat, self]);

  const forwardMessage = useCallback(async (message: Message, recipientIds: string[]) => {
    if (!self || !firestore) return;
    
    const batch = writeBatch(firestore);

    for (const recipientId of recipientIds) {
        const forwardedMessage = {
            ...message,
            senderId: self.id,
            recipientId: recipientId,
            readStatus: 'sent' as const,
        };
        delete forwardedMessage.id;
        delete forwardedMessage.timestamp;

        const newDocRef = doc(collection(firestore, 'messages'));
        batch.set(newDocRef, { ...forwardedMessage, timestamp: serverTimestamp() });
    }
    await batch.commit();
  }, [self, firestore]);

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
        const batch = writeBatch(firestore);
        let hasUnread = false;
        messages.forEach((m) => {
            if (m.senderId === selectedContact.id && m.recipientId === self.id && m.readStatus !== 'read') {
                const messageRef = doc(firestore, 'messages', m.id);
                batch.update(messageRef, { readStatus: 'read' });
                hasUnread = true;
            }
        });
        if (hasUnread) {
            batch.commit().catch(serverError => {
                const permissionError = new FirestorePermissionError({
                    path: `messages/[multiple]`,
                    operation: 'update',
                    requestResourceData: { readStatus: 'read' },
                });
                errorEmitter.emit('permission-error', permissionError);
            });
        }
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
