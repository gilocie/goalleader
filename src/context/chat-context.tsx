

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
  isVideoCallOpen: boolean;
  setIsVideoCallOpen: Dispatch<SetStateAction<boolean>>;
  isVoiceCallOpen: boolean;
  setIsVoiceCallOpen: Dispatch<SetStateAction<boolean>>;
  isCallActive: () => boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

type SoundType = 'call-cuts' | 'call-ring' | 'incoming-tones' | 'message-sent' | 'notifications-tones';

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const { user: firebaseUser } = useUser(); // Firebase user
  const { allTeamMembers, updateUserStatus } = useUserContext();
  const firestore = useFirestore();
  
  const messagesQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'messages'), orderBy('timestamp', 'asc'));
  }, [firestore]);

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

  // Ringtones - Create reusable audio element
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentSoundType = useRef<SoundType | null>(null);

  const stopAllSounds = useCallback(() => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      console.log('[Audio] Stopped all sounds');
    }
    currentSoundType.current = null;
  }, []);

  const playSound = useCallback((type: SoundType, fileName: string = 'default.mp3') => {
    // Don't replay the same sound if it's already playing
    if (currentSoundType.current === type && audioRef.current && !audioRef.current.paused) {
      console.log(`[Audio] ${type} is already playing, skipping`);
      return;
    }
    
    stopAllSounds();

    setTimeout(() => {
      try {
        if (!audioRef.current) {
          audioRef.current = new Audio();
        }
        
        const soundPath = `/sounds/${type}/${fileName}`;
        console.log(`[Audio] Loading: ${soundPath}`);
        
        audioRef.current.src = soundPath;
        audioRef.current.loop = (type === 'call-ring' || type === 'incoming-tones');
        currentSoundType.current = type;

        // Handle errors
        audioRef.current.onerror = () => {
          console.error(`[Audio] ❌ Failed to load: ${soundPath}`);
          console.error(`Please verify file exists at: public${soundPath}`);
          stopAllSounds();
        };

        // Handle successful load
        audioRef.current.onloadeddata = () => {
          console.log(`[Audio] ✓ Loaded: ${soundPath}`);
        };

        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log(`[Audio] ✓ Playing: ${type}/${fileName}`);
            })
            .catch(error => {
              if (error.name === 'NotAllowedError') {
                console.warn('[Audio] Blocked by browser - user interaction required');
              } else if (error.name !== 'AbortError') {
                console.error(`[Audio] Play error:`, error.name, error.message);
              }
            });
        }
      } catch (error) {
        console.error(`[Audio] Setup failed:`, error);
      }
    }, 100);
  }, [stopAllSounds]);


  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('[Audio] Component unmounting, stopping sounds');
      stopAllSounds();
      if (audioRef.current) {
        audioRef.current.src = '';
        audioRef.current.load();
      }
    };
  }, [stopAllSounds]);


  const allContacts = useMemo(() => {
    if (!allTeamMembers || !messages) return [];
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
    
    // Listen for calls where the current user is a participant
    const callsQuery = query(
      callsRef, 
      where('participantIds', 'array-contains', firebaseUser.uid),
      where('status', 'in', ['ringing', 'active', 'ended', 'declined', 'missed'])
    );
  
    const unsubscribe = onSnapshot(
      callsQuery, 
      (snapshot) => {
        // Track if we have any active/ringing calls
        let hasActiveCall = false;
        let currentCallDoc: Call | null = null;
        
        snapshot.forEach((docSnapshot) => {
          const data = docSnapshot.data();
          if (!data) return;
          
          const callData: Call = { 
            id: docSnapshot.id, 
            callerId: data.callerId,
            recipientId: data.recipientId,
            participantIds: data.participantIds,
            status: data.status,
            type: data.type,
            createdAt: data.createdAt,
            acceptedAt: data.acceptedAt,
            endedAt: data.endedAt,
          };
          
          // Only consider ringing or active calls as "current"
          if (callData.status === 'ringing' || callData.status === 'active') {
            hasActiveCall = true;
            currentCallDoc = callData;
          }
          
          // Handle ended/declined/missed calls
          if (callData.status === 'ended' || callData.status === 'declined' || callData.status === 'missed') {
            // Clear all call-related states when call ends
            if (currentCall?.id === callData.id) {
              console.log('[Chat Context] Call ended/declined/missed, clearing states');
              
              // Clear all states immediately
              setCurrentCall(null);
              setAcceptedCallContact(null);
              setAcceptedVoiceCallContact(null);
              setIncomingCallFrom(null);
              setIncomingVoiceCallFrom(null);
              setIsVideoCallOpen(false);
              setIsVoiceCallOpen(false);
              
              // Clean up the call document after a delay
              setTimeout(async () => {
                try {
                  const callDocRef = doc(firestore, 'calls', callData.id);
                  await deleteDoc(callDocRef);
                  
                  // Clean up ICE candidates
                  const iceCandidatesRef = collection(firestore, 'calls', callData.id, 'iceCandidates');
                  const iceCandidatesSnapshot = await getDocs(iceCandidatesRef);
                  const deletePromises = iceCandidatesSnapshot.docs.map(iceDoc => deleteDoc(iceDoc.ref));
                  await Promise.all(deletePromises);
                } catch (err) {
                  console.log('Call cleanup: Document already deleted or permission denied');
                }
              }, 3000);
            }
            return; // Don't process ended calls further
          }
        });
        
        // If no active calls, clear everything
        if (!hasActiveCall) {
          stopAllSounds();
          console.log('[Chat Context] No active calls, clearing all states');
          setCurrentCall(null);
          setAcceptedCallContact(null);
          setAcceptedVoiceCallContact(null);
          setIncomingCallFrom(null);
          setIncomingVoiceCallFrom(null);
          setIsVideoCallOpen(false);
          setIsVoiceCallOpen(false);
          return;
        }
        
        // Process the current call
        if (currentCallDoc) {
          const callDocToProcess: Call = currentCallDoc; // Create a new reference to help TypeScript
          
          const otherParticipantId = callDocToProcess.callerId === firebaseUser.uid 
            ? callDocToProcess.recipientId 
            : callDocToProcess.callerId;
          
          const otherParticipant = allContacts.find(c => c.id === otherParticipantId);
          
          if (!otherParticipant) {
            console.log('[Chat Context] Other participant not found in contacts');
            return;
          }
          
          setCurrentCall(callDocToProcess);
          
          // Handle incoming calls
          if (callDocToProcess.recipientId === firebaseUser.uid && callDocToProcess.status === 'ringing') {
            playSound('incoming-tones', 'goal-ring1.mp3');
            if (callDocToProcess.type === 'voice') {
              setIncomingVoiceCallFrom(otherParticipant);
              setIsVoiceCallOpen(true);
            } else {
              setIncomingCallFrom(otherParticipant);
              setIsVideoCallOpen(true);
            }
          }
          
          // Handle accepted calls
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
      const selfInList = allContacts.find(c => c.id === firebaseUser.uid);
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
    const contactList = allContacts.filter(c => {
        if (c.id === firebaseUser.uid) return false;
        const hasMessages = messages.some(m => 
            ((m.senderId === c.id && m.recipientId === firebaseUser.uid && !m.deletedByRecipient) || 
            (m.senderId === firebaseUser.uid && m.recipientId === c.id && !m.deletedBySender))
        );
        return hasMessages;
    });
    
    contactList.sort((a, b) => {
        if (!firebaseUser || !messages) return 0;
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
    playSound('message-sent', 'goal-sent1.mp3');
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
    const messageToDelete = messages.find(m => m.id === messageId);
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
                    setMessages(prev => prev.map(m =>
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
        if (setMessages) {
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
      playSound('call-ring', 'goal-calling1.mp3');
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
          stopAllSounds();
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
    playSound('call-cuts', 'default.mp3');
    try {
      // Update call status in Firestore
      await updateDoc(doc(firestore, 'calls', currentCall.id), { 
        status: 'ended',
        endedAt: serverTimestamp()
      });
      
      // Add system message
      addSystemMessage(`Voice call ended`, contactId, 'voice');
      
      // The listener will handle clearing states
      
    } catch (error) {
      console.error('Failed to end voice call:', error);
      // Even if update fails, clear local states
      setAcceptedVoiceCallContact(null);
      setCurrentCall(null);
      setIncomingVoiceCallFrom(null);
      setIsVoiceCallOpen(false);
    }
  }, [firestore, currentCall, addSystemMessage, playSound]);
  
  const declineVoiceCall = useCallback(async () => {
    if (!firestore || !currentCall || !incomingVoiceCallFrom) return;
    playSound('call-cuts', 'default.mp3');
    await updateDoc(doc(firestore, 'calls', currentCall.id), { status: 'declined' });
    addSystemMessage(`Missed voice call from ${incomingVoiceCallFrom.name}`, incomingVoiceCallFrom.id, 'voice');
    setIncomingVoiceCallFrom(null);
    setCurrentCall(null);
  }, [firestore, currentCall, incomingVoiceCallFrom, addSystemMessage, playSound]);

  const startCall = useCallback(async (contact: Contact) => {
    if (!self || !firestore) return;
    
    try {
      playSound('call-ring', 'goal-calling1.mp3');
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
          stopAllSounds();
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
    playSound('call-cuts', 'default.mp3');
    try {
      // Update call status in Firestore
      await updateDoc(doc(firestore, 'calls', currentCall.id), { 
        status: 'ended',
        endedAt: serverTimestamp()
      });
      
      // Add system message
      addSystemMessage(`Video call ended`, contactId, 'video');
      
      // The listener will handle clearing states
      
    } catch (error) {
      console.error('Failed to end video call:', error);
      // Even if update fails, clear local states
      setAcceptedCallContact(null);
      setCurrentCall(null);
      setIncomingCallFrom(null);
      setIsVideoCallOpen(false);
    }
  }, [firestore, currentCall, addSystemMessage, playSound]);

  const declineCall = useCallback(async () => {
    if (!firestore || !currentCall || !incomingCallFrom) return;
    playSound('call-cuts', 'default.mp3');
    await updateDoc(doc(firestore, 'calls', currentCall.id), { status: 'declined' });
    addSystemMessage(`Missed video call from ${incomingCallFrom.name}`, incomingCallFrom.id, 'video');
    setIncomingCallFrom(null);
    setCurrentCall(null);
  }, [firestore, currentCall, incomingCallFrom, addSystemMessage, playSound]);
  
  useEffect(() => {
    if (!self || !firestore || !messages) return;
  
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
  }, [messages, selectedContact, self, firestore]);

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
