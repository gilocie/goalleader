

'use client';

import React, { createContext, useState, useContext, ReactNode, useMemo, Dispatch, SetStateAction, useCallback, useEffect } from 'react';
import type { Contact, Message } from '@/types/chat';
import { format } from 'date-fns';
import { useUser } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, deleteDoc, doc, updateDoc, writeBatch } from 'firebase/firestore';
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
  inputMessage: string;
  setInputMessage: Dispatch<SetStateAction<string>>;
  addMessage: (content: string, recipientId: string, type: 'text' | 'audio' | 'image' | 'file', data?: Partial<Message>) => void;
  updateMessage: (messageId: string, newContent: string) => void;
  deleteMessage: (messageId: string, deleteForEveryone: boolean) => void;
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
  const { allTeamMembers, updateUserStatus } = useUserContext();
  const firestore = useFirestore();
  
  const messagesQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'messages'), orderBy('timestamp', 'asc'));
  }, [firestore]);

  const { data: messages, setData: setMessages } = useCollection<Message>(messagesQuery);
  
  const [activeChats, setActiveChats] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [incomingCallFrom, setIncomingCallFrom] = useState<Contact | null>(null);
  const [acceptedCallContact, setAcceptedCallContact] = useState<Contact | null>(null);
  const [incomingVoiceCallFrom, setIncomingVoiceCallFrom] = useState<Contact | null>(null);
  const [acceptedVoiceCallContact, setAcceptedVoiceCallContact] = useState<Contact | null>(null);
  
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [inputMessage, setInputMessage] = useState('');

  const allContacts = useMemo(() => {
    if (!allTeamMembers) return [];
    return allTeamMembers.map(member => {
        const relevantMessages = messages.filter(
            msg => (msg.senderId === member.id && msg.recipientId === firebaseUser?.uid) ||
                   (msg.senderId === firebaseUser?.uid && msg.recipientId === member.id)
        );
        const lastMessage = relevantMessages.sort((a, b) => {
            const timeA = a.timestamp?.toMillis() || 0;
            const timeB = b.timestamp?.toMillis() || 0;
            return timeB - timeA;
        })[0];
        
        const unreadCount = messages.filter(msg => msg.senderId === member.id && msg.recipientId === firebaseUser?.uid && msg.readStatus !== 'read').length;

        return {
            ...member,
            status: member.status || 'offline',
            lastMessage: lastMessage?.isSystem ? 'Call' : lastMessage?.content || '',
            lastMessageTime: lastMessage?.timestamp ? format(lastMessage.timestamp.toDate(), 'p') : '',
            unreadCount: selectedContact?.id === member.id ? 0 : unreadCount,
            lastMessageReadStatus: lastMessage?.senderId === firebaseUser?.uid ? lastMessage.readStatus : undefined,
            lastMessageSenderId: lastMessage?.senderId,
        };
    });
  }, [messages, selectedContact, firebaseUser, allTeamMembers]);


  const self = useMemo(() => {
      if (!firebaseUser) return undefined;
      const selfInList = allContacts.find(c => c.id === firebaseUser.uid);
      if (selfInList) return selfInList;

      return {
          id: firebaseUser.uid,
          name: firebaseUser.isAnonymous ? 'Guest User' : (firebaseUser.displayName || 'You'),
          role: 'Consultant',
          status: 'online',
          department: 'Customer Service'
      }
  }, [allContacts, firebaseUser]);

  useEffect(() => {
    if(firebaseUser) {
        updateUserStatus(firebaseUser.uid, 'online');
    }
  }, [firebaseUser, updateUserStatus]);
  
  const contacts = useMemo(() => {
    if (!firebaseUser) return [];
    const contactList = allContacts.filter(c => {
        if (c.id === firebaseUser.uid) return false;
        const hasMessages = messages.some(m => 
            ((m.senderId === c.id && m.recipientId === firebaseUser.uid && !m.deletedByRecipient) || 
            (m.senderId === firebaseUser.uid && m.recipientId === c.id && !m.deletedBySender))
        );
        return hasMessages;
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
  }, [allContacts, messages, firebaseUser]);
  
  const unreadMessagesCount = useMemo(() => contacts.reduce((count, contact) => count + (contact.unreadCount || 0), 0), [contacts]);


  const addMessage = useCallback((content: string, recipientId: string, type: 'text' | 'audio' | 'image' | 'file', data: Partial<Message> = {}) => {
    if (!self || !firestore) return;

    const messagesCollection = collection(firestore, 'messages');

    const newMessageData: Omit<Message, 'id'| 'timestamp'> = {
      senderId: self.id,
      recipientId,
      content,
      readStatus: 'sent',
      type: type,
      ...data,
    };

    addDoc(messagesCollection, {
      ...newMessageData,
      timestamp: serverTimestamp(),
    }).catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: messagesCollection.path,
        operation: 'create',
        requestResourceData: { ...newMessageData, timestamp: new Date().toISOString() },
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  }, [self, firestore]);

  const updateMessage = useCallback(async (messageId: string, newContent: string) => {
    if (!firestore || !self) return;
    const messageRef = doc(firestore, 'messages', messageId);
    
    updateDoc(messageRef, {
      content: newContent,
      readStatus: 'updated',
    }).catch(serverError => {
      const permissionError = new FirestorePermissionError({
        path: messageRef.path,
        operation: 'update',
        requestResourceData: { content: newContent, readStatus: 'updated' },
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  }, [firestore, self]);

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

 const deleteMessage = useCallback(async (messageId: string, deleteForEveryone: boolean = false) => {
    if (!firestore || !self) return;
    const messageRef = doc(firestore, 'messages', messageId);
    const messageToDelete = messages.find(m => m.id === messageId);
    if (!messageToDelete) return;

    if (deleteForEveryone) {
      if (messageToDelete.senderId === self.id) {
        deleteDoc(messageRef)
          .then(() => {
            setMessages(prev => prev.filter(m => m.id !== messageId));
          })
          .catch(err => {
            const permissionError = new FirestorePermissionError({
              path: messageRef.path,
              operation: 'delete',
            });
            errorEmitter.emit('permission-error', permissionError);
          });
      }
    } else {
        const isSender = messageToDelete.senderId === self.id;
        const updateData: { deletedBySender?: boolean; deletedByRecipient?: boolean } = {};

        if (isSender) {
            updateData.deletedBySender = true;
        } else {
            updateData.deletedByRecipient = true;
        }
        
        await updateDoc(messageRef, updateData)
            .then(() => {
                setMessages(prev => prev.map(m =>
                    m.id === messageId ? { ...m, ...updateData } : m
                ));
            })
            .catch(serverError => {
                const permissionError = new FirestorePermissionError({
                    path: messageRef.path,
                    operation: 'update',
                    requestResourceData: updateData,
                });
                errorEmitter.emit('permission-error', permissionError);
            });
    }
}, [firestore, self, messages, setMessages]);


  const clearChat = useCallback(async (contactId: string) => {
    if (!self || !firestore) return;
    
    const chatMessagesToUpdate = messages.filter(
      msg => ((msg.senderId === contactId && msg.recipientId === self.id) || (msg.senderId === self.id && msg.recipientId === contactId))
    );

    if (chatMessagesToUpdate.length === 0) return;

    const batch = writeBatch(firestore);
    chatMessagesToUpdate.forEach(msg => {
      const messageRef = doc(firestore, 'messages', msg.id);
      const isSender = msg.senderId === self.id;
       const updateData = {
          deletedBySender: isSender || msg.deletedBySender,
          deletedByRecipient: !isSender || msg.deletedByRecipient,
       };
      batch.update(messageRef, updateData);
    });
    
    await batch.commit()
      .then(() => {
        setMessages(prev => prev.map(m => {
          const shouldBeDeleted = chatMessagesToUpdate.some(del => del.id === m.id);
          if (shouldBeDeleted) {
            const isSender = m.senderId === self.id;
            return { ...m, deletedBySender: isSender || m.deletedBySender, deletedByRecipient: !isSender || m.deletedByRecipient };
          }
          return m;
        }));
      })
      .catch(serverError => {
            const permissionError = new FirestorePermissionError({
                path: 'messages/[batch]',
                operation: 'update',
                requestResourceData: { deletedBySender: true, deletedByRecipient: true },
            });
            errorEmitter.emit('permission-error', permissionError);
    });
  }, [self, firestore, messages, setMessages]);

  const deleteChat = useCallback(async (contactId: string) => {
    await clearChat(contactId);
  }, [clearChat]);

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
    if (!self || !firestore) return;
  
    const batch = writeBatch(firestore);
    let updatesMade = false;
  
    messages.forEach((m) => {
      // Mark as delivered if received and not yet delivered/read
      if (m.recipientId === self.id && m.readStatus === 'sent') {
        const messageRef = doc(firestore, 'messages', m.id);
        batch.update(messageRef, { readStatus: 'delivered' });
        updatesMade = true;
      }
      // Mark as read if the chat is open
      if (selectedContact && m.senderId === selectedContact.id && m.recipientId === self.id && m.readStatus !== 'read') {
        const messageRef = doc(firestore, 'messages', m.id);
        batch.update(messageRef, { readStatus: 'read' });
        updatesMade = true;
      }
    });
  
    if (updatesMade) {
      batch.commit().catch(serverError => {
        const permissionError = new FirestorePermissionError({
          path: `messages/[multiple]`,
          operation: 'update',
          requestResourceData: { readStatus: 'read/delivered' },
        });
        errorEmitter.emit('permission-error', permissionError);
      });
    }
  }, [messages, selectedContact, self, firestore]);


  const value = {
    self,
    contacts,
    allContacts,
    messages,
    unreadMessagesCount,
    selectedContact,
    setSelectedContact,
    addMessage,
    updateMessage,
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
    inputMessage,
    setInputMessage
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
