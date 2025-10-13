

'use client';

import React, { createContext, useState, useContext, ReactNode, useMemo, Dispatch, SetStateAction, useCallback, useEffect } from 'react';
import type { Contact, Message } from '@/types/chat';
import { format } from 'date-fns';
import { useUser } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, deleteDoc, doc, updateDoc, writeBatch, onSnapshot, where, getDocs, FirestoreError, getDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useCollection, useDoc } from '@/firebase';
import { useUser as useUserContext } from './user-context';
import type { Call } from '@/types/chat';
import { WebRTCService } from '@/lib/webrtc-service';

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
  currentCall: Call | null;
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
  
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [inputMessage, setInputMessage] = useState('');

  // Voice & Video Call State
  const [currentCall, setCurrentCall] = useState<Call | null>(null);
  const [incomingVoiceCallFrom, setIncomingVoiceCallFrom] = useState<Contact | null>(null);
  const [acceptedVoiceCallContact, setAcceptedVoiceCallContact] = useState<Contact | null>(null);
  const [incomingCallFrom, setIncomingCallFrom] = useState<Contact | null>(null);
  const [acceptedCallContact, setAcceptedCallContact] = useState<Contact | null>(null);

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
            lastMessageReadStatus: lastMessage?.senderId === firebaseUser?.uid ? lastMessage?.readStatus : undefined,
            lastMessageSenderId: lastMessage?.senderId,
        };
    });
  }, [messages, selectedContact, firebaseUser, allTeamMembers]);

  // --- Real-time call listener ---
  useEffect(() => {
    if (!firestore || !firebaseUser || allContacts.length === 0) return;
  
    const callsRef = collection(firestore, 'calls');
    
    // Listen for incoming calls (where I'm the recipient)
    const incomingQuery = query(
      callsRef, 
      where('recipientId', '==', firebaseUser.uid),
      where('status', 'in', ['ringing', 'active'])
    );
    
    // Listen for outgoing calls (where I'm the caller)
    const outgoingQuery = query(
      callsRef,
      where('callerId', '==', firebaseUser.uid),
      where('status', 'in', ['ringing', 'active'])
    );
  
    const unsubIncoming = onSnapshot(
      incomingQuery, 
      (snapshot) => {
        if (!snapshot.empty) {
          const callDoc = snapshot.docs[0];
          const callData = { id: callDoc.id, ...callDoc.data() } as Call;
          const caller = allContacts.find(c => c.id === callData.callerId);
          
          if (caller) {
            setCurrentCall(callData);
            
            // Only show incoming notification if status is still 'ringing'
            if (callData.status === 'ringing') {
              if (callData.type === 'voice') {
                setIncomingVoiceCallFrom(caller);
              } else {
                setIncomingCallFrom(caller);
              }
            } else if (callData.status === 'active') {
              // Call was accepted
              if (callData.type === 'voice') {
                setAcceptedVoiceCallContact(caller);
                setIncomingVoiceCallFrom(null);
              } else {
                setAcceptedCallContact(caller);
                setIncomingCallFrom(null);
              }
            }
          }
        } else {
          // No incoming calls
          setIncomingVoiceCallFrom(null);
          setIncomingCallFrom(null);
        }
      },
      (error: FirestoreError) => {
        if (error.code === 'permission-denied') {
          const permissionError = new FirestorePermissionError({
            path: 'calls',
            operation: 'list',
          });
          errorEmitter.emit('permission-error', permissionError);
        } else {
          console.error("Incoming call listener error:", error);
        }
      }
    );
  
    const unsubOutgoing = onSnapshot(
      outgoingQuery,
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added' || change.type === 'modified') {
            const callData = { id: change.doc.id, ...change.doc.data() } as Call;
            
            // Only update if this is our current call
            if (!currentCall || currentCall.id === callData.id) {
              setCurrentCall(callData);
              
              // If call was accepted by recipient
              if (callData.status === 'active') {
                const recipient = allContacts.find(c => c.id === callData.recipientId);
                if (recipient) {
                  if (callData.type === 'voice') {
                    setAcceptedVoiceCallContact(recipient);
                  } else {
                    setAcceptedCallContact(recipient);
                  }
                }
              } else if (callData.status === 'declined' || callData.status === 'missed') {
                // Call was declined/missed
                setCurrentCall(null);
                setAcceptedVoiceCallContact(null);
                setAcceptedCallContact(null);
              }
            }
          }
        });
      },
      (error) => {
        console.error("Outgoing call listener error:", error);
      }
    );
  
    return () => {
      unsubIncoming();
      unsubOutgoing();
    };
  }, [firestore, firebaseUser, allContacts, currentCall]);

  const self = useMemo(() => {
      if (!firebaseUser) return undefined;
      const selfInList = allContacts.find(c => c.id === firebaseUser.uid);
      if (selfInList) return selfInList;

      return {
          id: firebaseUser.uid,
          name: firebaseUser.isAnonymous ? 'Guest User' : (firebaseUser.displayName || 'You'),
          role: 'Consultant',
          status: 'online',
          department: 'Customer Service',
          lastMessage: '',
          lastMessageTime: ''
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
        await deleteDoc(messageRef)
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
        const updateData: Partial<Message> = {};

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
      if (msg.senderId === self.id) {
        batch.update(messageRef, { deletedBySender: true });
      } else {
        batch.update(messageRef, { deletedByRecipient: true });
      }
    });
    
    await batch.commit()
      .then(() => {
        // Update local state to immediately reflect the change
        const updatedMessageIds = chatMessagesToUpdate.map(m => m.id);
        setMessages(prev => prev.map(m => {
          if (updatedMessageIds.includes(m.id)) {
            if (m.senderId === self.id) {
              return { ...m, deletedBySender: true };
            } else {
              return { ...m, deletedByRecipient: true };
            }
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
        const { id, timestamp, ...messageData } = message;
        const forwardedMessage = {
            ...messageData,
            senderId: self.id,
            recipientId: recipientId,
            readStatus: 'sent' as const,
        };

        const newDocRef = doc(collection(firestore, 'messages'));
        batch.set(newDocRef, { ...forwardedMessage, timestamp: serverTimestamp() });
    }
    await batch.commit();
  }, [self, firestore]);

  const startVoiceCall = useCallback(async (contact: Contact) => {
    if (!self || !firestore) return;
    
    try {
      const callData: Omit<Call, 'id'> = {
        callerId: self.id,
        recipientId: contact.id,
        status: 'ringing',
        type: 'voice',
        createdAt: serverTimestamp(),
      };
      
      const callDocRef = await addDoc(collection(firestore, 'calls'), callData);
      setCurrentCall({ id: callDocRef.id, ...callData });
      
      addSystemMessage(`Calling ${contact.name}...`, contact.id, 'voice');
      
      // Auto-timeout after 30 seconds
      setTimeout(async () => {
        const currentCallSnapshot = await getDoc(doc(firestore, 'calls', callDocRef.id));
        if (currentCallSnapshot.exists() && currentCallSnapshot.data()?.status === 'ringing') {
          await updateDoc(doc(firestore, 'calls', callDocRef.id), { 
            status: 'missed' 
          });
          addSystemMessage(`Missed call to ${contact.name}`, contact.id, 'voice');
        }
      }, 30000);
      
    } catch (error) {
      console.error('Failed to start voice call:', error);
    }
  }, [self, firestore, addSystemMessage]);
  
  const acceptVoiceCall = useCallback(async () => {
    if (!firestore || !currentCall || !incomingVoiceCallFrom) return;
    
    try {
      await updateDoc(doc(firestore, 'calls', currentCall.id), { 
        status: 'active',
        acceptedAt: serverTimestamp()
      });
      
      addSystemMessage(
        `Voice call with ${incomingVoiceCallFrom.name} started`, 
        incomingVoiceCallFrom.id, 
        'voice'
      );
      
      setAcceptedVoiceCallContact(incomingVoiceCallFrom);
      setIncomingVoiceCallFrom(null);
    } catch (error) {
      console.error('Failed to accept voice call:', error);
    }
  }, [firestore, currentCall, incomingVoiceCallFrom, addSystemMessage]);

  const endVoiceCall = useCallback(async (contactId: string) => {
    if (!firestore || !currentCall) return;
    
    try {
      await updateDoc(doc(firestore, 'calls', currentCall.id), { 
        status: 'ended',
        endedAt: serverTimestamp()
      });
      
      addSystemMessage(`Voice call ended`, contactId, 'voice');
      
      setAcceptedVoiceCallContact(null);
      setCurrentCall(null);
      setIncomingVoiceCallFrom(null);
      
      setTimeout(async () => {
        try {
          const callDocRef = doc(firestore, 'calls', currentCall.id);
          const callSnapshot = await getDoc(callDocRef);
          
          if (callSnapshot.exists() && callSnapshot.data()?.status === 'ended') {
            await deleteDoc(callDocRef);
            
            const iceCandidatesRef = collection(firestore, 'calls', currentCall.id, 'iceCandidates');
            const iceCandidatesSnapshot = await getDocs(iceCandidatesRef);
            const deletePromises = iceCandidatesSnapshot.docs.map(doc => deleteDoc(doc.ref));
            await Promise.all(deletePromises);
          }
        } catch (err) {
          console.log('Call cleanup: Document already deleted or permission denied');
        }
      }, 5000);
      
    } catch (error) {
      console.error('Failed to end voice call:', error);
    }
  }, [firestore, currentCall, addSystemMessage]);
  
  const declineVoiceCall = useCallback(async () => {
    if (!firestore || !currentCall || !incomingVoiceCallFrom) return;
    await updateDoc(doc(firestore, 'calls', currentCall.id), { status: 'declined' });
    addSystemMessage(`Missed voice call from ${incomingVoiceCallFrom.name}`, incomingVoiceCallFrom.id, 'voice');
    setIncomingVoiceCallFrom(null);
    setCurrentCall(null);
  }, [firestore, currentCall, incomingVoiceCallFrom, addSystemMessage]);

  const startCall = useCallback(async (contact: Contact) => {
    if (!self || !firestore) return;
    
    try {
      const callData: Omit<Call, 'id'> = {
        callerId: self.id,
        recipientId: contact.id,
        status: 'ringing',
        type: 'video',
        createdAt: serverTimestamp(),
      };
      
      const callDocRef = await addDoc(collection(firestore, 'calls'), callData);
      setCurrentCall({ id: callDocRef.id, ...callData });
      
      addSystemMessage(`Calling ${contact.name}...`, contact.id, 'video');
      
      setTimeout(async () => {
        const currentCallSnapshot = await getDoc(doc(firestore, 'calls', callDocRef.id));
        if (currentCallSnapshot.exists() && currentCallSnapshot.data()?.status === 'ringing') {
          await updateDoc(doc(firestore, 'calls', callDocRef.id), { 
            status: 'missed' 
          });
          addSystemMessage(`Missed video call to ${contact.name}`, contact.id, 'video');
        }
      }, 30000);
      
    } catch (error) {
      console.error('Failed to start video call:', error);
    }
  }, [self, firestore, addSystemMessage]);

  const acceptCall = useCallback(async () => {
    if (!firestore || !currentCall || !incomingCallFrom) return;
    
    try {
      await updateDoc(doc(firestore, 'calls', currentCall.id), { 
        status: 'active',
        acceptedAt: serverTimestamp()
      });
      
      addSystemMessage(
        `Video call with ${incomingCallFrom.name} started`, 
        incomingCallFrom.id, 
        'video'
      );
      
      setAcceptedCallContact(incomingCallFrom);
      setIncomingCallFrom(null);
    } catch (error) {
      console.error('Failed to accept video call:', error);
    }
  }, [firestore, currentCall, incomingCallFrom, addSystemMessage]);
  
  const endCall = useCallback(async (contactId: string) => {
    if (!firestore || !currentCall) return;
    
    try {
      await updateDoc(doc(firestore, 'calls', currentCall.id), { 
        status: 'ended',
        endedAt: serverTimestamp()
      });
      
      addSystemMessage(`Video call ended`, contactId, 'video');
      
      setAcceptedCallContact(null);
      setCurrentCall(null);
      setIncomingCallFrom(null);
      
      setTimeout(async () => {
        try {
          const callDocRef = doc(firestore, 'calls', currentCall.id);
          const callSnapshot = await getDoc(callDocRef);
          
          if (callSnapshot.exists() && callSnapshot.data()?.status === 'ended') {
            await deleteDoc(callDocRef);
            
            const iceCandidatesRef = collection(firestore, 'calls', currentCall.id, 'iceCandidates');
            const iceCandidatesSnapshot = await getDocs(iceCandidatesRef);
            const deletePromises = iceCandidatesSnapshot.docs.map(doc => deleteDoc(doc.ref));
            await Promise.all(deletePromises);
          }
        } catch (err) {
          console.log('Call cleanup: Document already deleted or permission denied');
        }
      }, 5000);
      
    } catch (error) {
      console.error('Failed to end video call:', error);
    }
  }, [firestore, currentCall, addSystemMessage]);

  const declineCall = useCallback(async () => {
    if (!firestore || !currentCall || !incomingCallFrom) return;
    await updateDoc(doc(firestore, 'calls', currentCall.id), { status: 'declined' });
    addSystemMessage(`Missed video call from ${incomingCallFrom.name}`, incomingCallFrom.id, 'video');
    setIncomingCallFrom(null);
    setCurrentCall(null);
  }, [firestore, currentCall, incomingCallFrom, addSystemMessage]);
  
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


  const value: ChatContextType = {
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
    currentCall,
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
