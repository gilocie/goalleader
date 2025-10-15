

'use client';

import React, { createContext, useState, useContext, ReactNode, useMemo, Dispatch, SetStateAction, useCallback, useEffect, useRef } from 'react';
import type { Contact, Message } from '@/types/chat';
import { format } from 'date-fns';
import { useUser } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, deleteDoc, doc, updateDoc, writeBatch, onSnapshot, where, getDocs, FirestoreError, getDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useCollection, useDoc } from '@/firebase';
import { useUser as useUserContext } from '@/context/user-context';
import type { Call } from '@/types/chat';
import { WebRTCService } from '@/lib/webrtc-service';
import type { TeamMember } from '@/lib/users';

interface ChatContextType {
  self: Contact | undefined;
  contacts: Contact[];
  allContacts: Contact[];
  messages: Message[];
  unreadMessagesCount: number;
  selectedContact: Contact | null;
  setSelectedContact: Dispatch<React.SetStateAction<Contact | null>>;
  inputMessage: string;
  setInputMessage: Dispatch<React.SetStateAction<string>>;
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
  setAcceptedCallContact: Dispatch<React.SetStateAction<Contact | null>>;
  incomingVoiceCallFrom: Contact | null;
  startVoiceCall: (contact: Contact) => void;
  endVoiceCall: (contactId: string) => void;
  acceptVoiceCall: () => void;
  declineVoiceCall: () => void;
  acceptedVoiceCallContact: Contact | null;
  setAcceptedVoiceCallContact: Dispatch<React.SetStateAction<Contact | null>>;
  isVideoCallOpen: boolean;
  setIsVideoCallOpen: Dispatch<React.SetStateAction<boolean>>;
  isVoiceCallOpen: boolean;
  setIsVoiceCallOpen: Dispatch<React.SetStateAction<boolean>>;
  isCallActive: () => boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

type SoundType = 'call-cuts' | 'call-ring' | 'incoming-tones' | 'message-sent' | 'notifications-tones';

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const { user: firebaseUser } = useUser(); // Firebase user
  const { allTeamMembers, updateUserStatus } = useUserContext();
  const firestore = useFirestore();
  
  const messagesQuery = useMemo(() => {
    if (!firestore || !firebaseUser) return null; // FIX: Only query if user is logged in
    return query(collection(firestore, 'messages'), orderBy('timestamp', 'asc'));
  }, [firestore, firebaseUser]);

  const { data: messages, setData: setMessages } = useCollection<Message>(messagesQuery);
  
  const [isTyping, setIsTyping] = useState(false);
  
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [inputMessage, setInputMessage] = useState('');

  // Voice & Video Call State
  const [currentCall, setCurrentCall] = useState<Call | null>(null);
  const [incomingVoiceCallFrom, setIncomingVoiceCallFrom] = useState<Contact | null>(null);
  const [acceptedVoiceCallContact, setAcceptedVoiceCallContact] = useState<Contact | null>(null);
  const [incomingCallFrom, setIncomingCallFrom] = useState<Contact | null>(null);
  const [acceptedCallContact, setAcceptedCallContact] = useState<Contact | null>(null);
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
  const [isVoiceCallOpen, setIsVoiceCallOpen] = useState(false);

const audioRef = useRef<HTMLAudioElement | null>(null);

useEffect(() => {
  if (typeof window !== "undefined" && !audioRef.current) {
    audioRef.current = new Audio();
    audioRef.current.preload = "auto";
  }
}, []);


const playSound = useCallback((type: SoundType, fileName: string = 'default.mp3') => {
  if (!audioRef.current) return;

  const soundPath = `/sounds/${type}/${fileName}`;
  const audio = audioRef.current;
  
  // If the same sound is already playing and supposed to loop, let it continue.
  if (audio.src.endsWith(soundPath) && !audio.paused && audio.loop) {
      return;
  }
  
  audio.pause();
  audio.loop = (type === 'call-ring' || type === 'incoming-tones');
  audio.src = soundPath;
  audio.currentTime = 0;
  
  const playPromise = audio.play();
  if (playPromise !== undefined) {
    playPromise.catch(error => {
      // Autoplay was prevented. This is common before the user interacts with the page.
      if (error.name === 'NotAllowedError') {
        console.warn(`[Audio] Autoplay for ${type} was blocked by the browser. User interaction is required.`);
      } else {
        console.error(`[Audio] Playback error for ${type}:`, error);
      }
    });
  }
}, []);

const stopAllSounds = useCallback(() => {
  if (audioRef.current) {
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  }
}, []);


const allContacts = useMemo(() => {
  if (!allTeamMembers || !messages) return [];
  
  return allTeamMembers.map((member: TeamMember) => {
    const relevantMessages = messages.filter(
      (msg: Message) => (msg.senderId === member.id && msg.recipientId === firebaseUser?.uid) ||
             (msg.senderId === firebaseUser?.uid && msg.recipientId === member.id)
    );
    
    const lastMessage = relevantMessages.sort((a: Message, b: Message) => {
      const timeA = a.timestamp?.toMillis() || 0;
      const timeB = b.timestamp?.toMillis() || 0;
      return timeB - timeA;
    })[0];
    
    const unreadCount = messages.filter((msg: Message) => 
        msg.senderId === member.id && 
        msg.recipientId === firebaseUser?.uid && 
        msg.readStatus !== 'read' &&
        !msg.isSystem // Exclude system messages (calls) from unread count
    ).length;

    return {
      ...member,
      status: member.status || 'offline',
      lastMessage: lastMessage?.isSystem ? 'Call' : lastMessage?.content || '',
      lastMessageTime: lastMessage?.timestamp ? format(lastMessage.timestamp.toDate(), 'p') : '',
      unreadCount: unreadCount,
      lastMessageReadStatus: lastMessage?.senderId === firebaseUser?.uid ? lastMessage?.readStatus : undefined,
      lastMessageSenderId: lastMessage?.senderId,
    };
  });
}, [messages, firebaseUser, allTeamMembers]);


  // --- Real-time call listener ---
  useEffect(() => {
    if (!firestore || !firebaseUser || allContacts.length === 0) return;
  
    const callsRef = collection(firestore, 'calls');
    
    const callsQuery = query(
      callsRef, 
      where('participantIds', 'array-contains', firebaseUser.uid)
    );
  
    const isInitialLoad = useRef(true);

    const unsubscribe = onSnapshot(
      callsQuery, 
      (snapshot) => {
        let hasActiveCall = false;
        let currentCallDoc: Call | null = null;
        
        snapshot.docChanges().forEach((change) => {
          const data = change.data();
          if (!data) return;
          
          const callData: Call = { 
            id: change.doc.id, 
            ...data
          } as Call;
          
          if (callData.status === 'ringing' || callData.status === 'active') {
            hasActiveCall = true;
            currentCallDoc = callData;
          }
          
          if (change.type === 'modified' || change.type === 'removed' || (change.type === 'added' && !isInitialLoad.current)) {
            if (callData.status === 'ended' || callData.status === 'declined' || callData.status === 'missed') {
                if (currentCall?.id === callData.id) {
                    playSound('call-cuts', 'default.mp3');
                }
                
                // Centralized state clearing
                setCurrentCall(null);
                setAcceptedCallContact(null);
                setAcceptedVoiceCallContact(null);
                setIncomingCallFrom(null);
                setIncomingVoiceCallFrom(null);
                setIsVideoCallOpen(false);
                setIsVoiceCallOpen(false);
                stopAllSounds();

                // Clean up Firestore docs after a delay
                setTimeout(async () => {
                  try {
                    await deleteDoc(doc(firestore, 'calls', callData.id));
                  } catch (err) {}
                }, 5000);
            }
          }
        });

        if (!hasActiveCall && !isInitialLoad.current) {
            stopAllSounds();
            setCurrentCall(null);
        }
        
        if (currentCallDoc) {
          const callDocToProcess: Call = currentCallDoc;
          
          const otherParticipantId = callDocToProcess.callerId === firebaseUser.uid 
            ? callDocToProcess.recipientId 
            : callDocToProcess.callerId;
          
          const otherParticipant = allContacts.find((c: Contact) => c.id === otherParticipantId);
          
          if (!otherParticipant) return;
          
          setCurrentCall(callDocToProcess);
          
          if (callDocToProcess.recipientId === firebaseUser.uid && callDocToProcess.status === 'ringing') {
            if (!isInitialLoad.current) playSound('incoming-tones', 'default.mp3');

            if (callDocToProcess.type === 'voice') {
              setIncomingVoiceCallFrom(otherParticipant);
              setIsVoiceCallOpen(true);
            } else {
              setIncomingCallFrom(otherParticipant);
              setIsVideoCallOpen(true);
            }
          }
          
          else if (callDocToProcess.status === 'active') {
            stopAllSounds();
            if (callDocToProcess.type === 'voice') {
              setAcceptedVoiceCallContact(otherParticipant);
              setIncomingVoiceCallFrom(null);
            } else {
              setAcceptedCallContact(otherParticipant);
              setIncomingCallFrom(null);
            }
          }
        }
        
        // After the first snapshot is processed, it's no longer the initial load
        isInitialLoad.current = false;
      },
      (error: FirestoreError) => {
        if (error.code === 'permission-denied') {
          const permissionError = new FirestorePermissionError({
            path: 'calls',
            operation: 'list',
          });
          errorEmitter.emit('permission-error', permissionError);
        } else {
          console.error("Call listener error:", error);
        }
      }
    );
  
    return () => unsubscribe();
  }, [firestore, firebaseUser, allContacts, currentCall, playSound, stopAllSounds]);

  const self = useMemo(() => {
      if (!firebaseUser) return undefined;
      const selfInList = allContacts.find((c: Contact) => c.id === firebaseUser.uid);
      if (selfInList) return selfInList;

      return {
          id: firebaseUser.uid,
          name: firebaseUser.isAnonymous ? 'Guest User' : (firebaseUser.displayName || 'You'),
          role: 'Consultant',
          department: 'Customer Service',
          status: 'online',
          lastMessage: '',
          lastMessageTime: '',
      }
  }, [allContacts, firebaseUser]);

  useEffect(() => {
    if(firebaseUser) {
        updateUserStatus(firebaseUser.uid, 'online');
    }
  }, [firebaseUser, updateUserStatus]);
  
  const contacts = useMemo(() => {
    if (!firebaseUser || !messages) return [];
    const contactList = allContacts.filter((c: Contact) => {
        if (c.id === firebaseUser.uid) return false;
        const hasMessages = messages.some((m: Message) => 
            ((m.senderId === c.id && m.recipientId === firebaseUser.uid && !m.deletedByRecipient) || 
            (m.senderId === firebaseUser.uid && m.recipientId === c.id && !m.deletedBySender))
        );
        return hasMessages;
    });
    
    contactList.sort((a, b) => {
        if (!firebaseUser || !messages) return 0;
        const lastMessageA = messages.filter((m: Message) => (m.senderId === a.id && m.recipientId === firebaseUser.uid) || (m.senderId === firebaseUser.uid && m.recipientId === a.id)).sort((m1, m2) => (m2.timestamp?.toMillis() || 0) - (m1.timestamp?.toMillis() || 0))[0];
        const lastMessageB = messages.filter((m: Message) => (m.senderId === b.id && m.recipientId === firebaseUser.uid) || (m.senderId === firebaseUser.uid && m.recipientId === b.id)).sort((m1, m2) => (m2.timestamp?.toMillis() || 0) - (m1.timestamp?.toMillis() || 0))[0];
        if (!lastMessageA) return 1;
        if (!lastMessageB) return -1;
        return (lastMessageB.timestamp?.toMillis() || 0) - (lastMessageA.timestamp?.toMillis() || 0);
    });

    return contactList;
  }, [allContacts, messages, firebaseUser]);
  
  const unreadMessagesCount = useMemo(() => contacts.reduce((count: number, contact: Contact) => count + (contact.unreadCount || 0), 0), [contacts]);


  const addMessage = useCallback((content: string, recipientId: string, type: 'text' | 'audio' | 'image' | 'file', data: Partial<Message> = {}) => {
    if (!self || !firestore) return;
    playSound('message-sent', 'default.mp3');
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
  }, [self, firestore, playSound]);

  const updateMessage = useCallback(async (messageId: string, newContent: string) => {
    if (!firestore || !self) return;
    const messageRef = doc(firestore, 'messages', messageId);
    
    updateDoc(messageRef, {
      content: newContent,
      readStatus: 'updated',
    }).catch(serverError => {
      if (serverError.code === 'permission-denied') {
        const permissionError = new FirestorePermissionError({
          path: messageRef.path,
          operation: 'update',
          requestResourceData: { content: newContent, readStatus: 'updated' },
        });
        errorEmitter.emit('permission-error', permissionError);
      }
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
    if (!firestore || !self || !messages) return;
    const messageRef = doc(firestore, 'messages', messageId);
    const messageToDelete = messages.find((m: Message) => m.id === messageId);
    if (!messageToDelete) return;

    if (deleteForEveryone) {
      if (messageToDelete.senderId === self.id) {
        await deleteDoc(messageRef)
          .catch(err => {
            if (err.code === 'permission-denied') {
              const permissionError = new FirestorePermissionError({
                path: messageRef.path,
                operation: 'delete',
              });
              errorEmitter.emit('permission-error', permissionError);
            }
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
                if (setMessages) {
                    setMessages((prev: Message[]) => prev.map(m =>
                        m.id === messageId ? { ...m, ...updateData } : m
                    ));
                }
            })
            .catch(serverError => {
              if (serverError.code === 'permission-denied') {
                const permissionError = new FirestorePermissionError({
                    path: messageRef.path,
                    operation: 'update',
                    requestResourceData: updateData,
                });
                errorEmitter.emit('permission-error', permissionError);
              }
            });
    }
}, [firestore, self, messages, setMessages]);


  const clearChat = useCallback(async (contactId: string) => {
    if (!self || !firestore || !messages) return;
    
    const chatMessagesToUpdate = messages.filter(
      (msg: Message) => ((msg.senderId === contactId && msg.recipientId === self.id) || (msg.senderId === self.id && msg.recipientId === contactId))
    );

    if (chatMessagesToUpdate.length === 0) return;

    const batch = writeBatch(firestore);
    
    chatMessagesToUpdate.forEach((msg: Message) => {
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
        if (setMessages) {
            const updatedMessageIds = chatMessagesToUpdate.map((m: Message) => m.id);
            setMessages((prev: Message[]) => prev.map((m: Message) => {
            if (updatedMessageIds.includes(m.id)) {
                if (m.senderId === self.id) {
                return { ...m, deletedBySender: true };
                } else {
                return { ...m, deletedByRecipient: true };
                }
            }
            return m;
            }));
        }
      })
      .catch(serverError => {
            if (serverError.code === 'permission-denied') {
                const permissionError = new FirestorePermissionError({
                    path: 'messages/[batch]',
                    operation: 'update',
                    requestResourceData: { deletedBySender: true, deletedByRecipient: true },
                });
                errorEmitter.emit('permission-error', permissionError);
            }
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
      playSound('call-ring', 'default.mp3');
      const callData: Omit<Call, 'id'> = {
        callerId: self.id,
        recipientId: contact.id,
        participantIds: [self.id, contact.id],
        status: 'ringing',
        type: 'voice',
        createdAt: serverTimestamp(),
      };
      
      const callDocRef = await addDoc(collection(firestore, 'calls'), callData);
      setCurrentCall({ id: callDocRef.id, ...callData });
      setIsVoiceCallOpen(true);
      
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
      stopAllSounds();
    }
  }, [self, firestore, addSystemMessage, playSound, stopAllSounds]);
  
  const acceptVoiceCall = useCallback(async () => {
    if (!firestore || !currentCall || !incomingVoiceCallFrom) return;
    stopAllSounds();
  
    console.log('[Chat Context] ==== ACCEPTING VOICE CALL ====');
    console.log('[Chat Context] Call ID:', currentCall.id);
    console.log('[Chat Context] Current status:', currentCall.status);
    
    try {
      await updateDoc(doc(firestore, 'calls', currentCall.id), { 
        status: 'active',
        acceptedAt: serverTimestamp()
      });
      
      console.log('[Chat Context] ✓ Call status updated to ACTIVE');
      
      addSystemMessage(
        `Voice call with ${incomingVoiceCallFrom.name} started`, 
        incomingVoiceCallFrom.id, 
        'voice'
      );
      
      setAcceptedVoiceCallContact(incomingVoiceCallFrom);
      setIncomingVoiceCallFrom(null);
      
      console.log('[Chat Context] ✓ State updated - call accepted');
    } catch (error) {
      console.error('[Chat Context] ✗ Failed to accept voice call:', error);
    }
  }, [firestore, currentCall, incomingVoiceCallFrom, addSystemMessage, stopAllSounds]);

  const endVoiceCall = useCallback(async (contactId: string) => {
    if (!firestore || !currentCall) return;
    
    try {
      await updateDoc(doc(firestore, 'calls', currentCall.id), { 
        status: 'ended',
        endedAt: serverTimestamp()
      });
      addSystemMessage(`Voice call ended`, contactId, 'voice');
    } catch (error) {
      console.error('Failed to end voice call:', error);
    } finally {
        // State clearing is now handled by the main listener
    }
  }, [firestore, currentCall, addSystemMessage]);
  
  const declineVoiceCall = useCallback(async () => {
    if (!firestore || !currentCall || !incomingVoiceCallFrom) return;
    
    await updateDoc(doc(firestore, 'calls', currentCall.id), { status: 'declined' });
    addSystemMessage(`Missed voice call from ${incomingVoiceCallFrom.name}`, incomingVoiceCallFrom.id, 'voice');

  }, [firestore, currentCall, incomingVoiceCallFrom, addSystemMessage]);

  const startCall = useCallback(async (contact: Contact) => {
    if (!self || !firestore) return;
    
    try {
      playSound('call-ring', 'default.mp3');
      const callData: Omit<Call, 'id'> = {
        callerId: self.id,
        recipientId: contact.id,
        participantIds: [self.id, contact.id],
        status: 'ringing',
        type: 'video',
        createdAt: serverTimestamp(),
      };
      
      const callDocRef = await addDoc(collection(firestore, 'calls'), callData);
      setCurrentCall({ id: callDocRef.id, ...callData });
      setIsVideoCallOpen(true);
      
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
      stopAllSounds();
    }
  }, [self, firestore, addSystemMessage, playSound, stopAllSounds]);

  const acceptCall = useCallback(async () => {
    if (!firestore || !currentCall || !incomingCallFrom) return;
    stopAllSounds();
    
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
  }, [firestore, currentCall, incomingCallFrom, addSystemMessage, stopAllSounds]);
  
  const endCall = useCallback(async (contactId: string) => {
    if (!firestore || !currentCall) return;
    
    try {
      await updateDoc(doc(firestore, 'calls', currentCall.id), { 
        status: 'ended',
        endedAt: serverTimestamp()
      });
      addSystemMessage(`Video call ended`, contactId, 'video');
    } catch (error) {
      console.error('Failed to end video call:', error);
    }
  }, [firestore, currentCall, addSystemMessage]);

  const declineCall = useCallback(async () => {
    if (!firestore || !currentCall || !incomingCallFrom) return;
    await updateDoc(doc(firestore, 'calls', currentCall.id), { status: 'declined' });
    addSystemMessage(`Missed video call from ${incomingCallFrom.name}`, incomingCallFrom.id, 'video');
  }, [firestore, currentCall, incomingCallFrom, addSystemMessage]);
  
const previousMessageIdsRef = useRef<Set<string>>(new Set());

useEffect(() => {
    if (!self || !firestore || !messages) return;

    const batch = writeBatch(firestore);
    let updatesMade = false;
    const newIncomingMessages: Message[] = [];

    const currentMessageIds = new Set(messages.map(m => m.id));

    messages.forEach((m) => {
      // 1. Mark as DELIVERED if received and not yet delivered/read
      if (m.recipientId === self.id && m.readStatus === 'sent' && !m.isSystem) {
        const messageRef = doc(firestore, 'messages', m.id);
        batch.update(messageRef, { readStatus: 'delivered' });
        updatesMade = true;

        if (!previousMessageIdsRef.current.has(m.id)) {
          newIncomingMessages.push(m);
        }
      }
      
      // 2. Mark as READ ONLY if:
      //    - Chat with sender is currently OPEN
      //    - Window/tab is VISIBLE
      //    - Message is 'sent' or 'delivered'
      if (
        selectedContact && 
        m.senderId === selectedContact.id && 
        m.recipientId === self.id && 
        (m.readStatus === 'sent' || m.readStatus === 'delivered') &&
        document.visibilityState === 'visible'
      ) {
        const messageRef = doc(firestore, 'messages', m.id);
        batch.update(messageRef, { readStatus: 'read' });
        updatesMade = true;
      }
    });

    // Update the previous message IDs set
    previousMessageIdsRef.current = currentMessageIds;

    // 🔊 Play notification sound ONLY for NEW incoming messages
    if (newIncomingMessages.length > 0) {
      const shouldPlaySound = newIncomingMessages.some(msg => {
        // Don't play sound if the chat is already open and visible
        return !(selectedContact && selectedContact.id === msg.senderId && document.visibilityState === 'visible');
      });

      if (shouldPlaySound) {
        playSound('notifications-tones', 'default.mp3');
      }
    }

    // Commit batch updates
    if (updatesMade) {
      batch.commit().catch(serverError => {
        if (serverError.code === 'permission-denied') {
          const permissionError = new FirestorePermissionError({
            path: `messages/[batch]`,
            operation: 'update',
            requestResourceData: { readStatus: 'read/delivered' },
          });
          errorEmitter.emit('permission-error', permissionError);
        }
      });
    }
  }, [messages, selectedContact, self, firestore, playSound]);


useEffect(() => {
  const handleVisibilityChange = () => {
    // The main read-receipt useEffect will handle the logic when it re-runs due to this state change
    // This just ensures it does re-run when the tab becomes visible
    if (document.visibilityState === 'visible' && selectedContact) {
      // Re-evaluating messages will trigger the main effect
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
}, [selectedContact]);


  const isCallActive = useCallback(() => {
    return !!(currentCall && (currentCall.status === 'ringing' || currentCall.status === 'active'));
  }, [currentCall]);


  const value: ChatContextType = {
    self,
    contacts,
    allContacts,
    messages: messages || [],
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
    isVideoCallOpen,
    setIsVideoCallOpen,
    isVoiceCallOpen,
    setIsVoiceCallOpen,
    inputMessage,
    setInputMessage,
    isCallActive
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
