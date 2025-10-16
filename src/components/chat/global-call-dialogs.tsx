'use client';

import { useChat } from '@/context/chat-context';
import { VoiceCallDialog } from '@/components/chat/voice-call-dialog';
import { VideoCallDialog } from '@/components/chat/video-call-dialog';
import { IncomingCallDialog } from '@/components/chat/incoming-call-dialog';
import { IncomingVoiceCallDialog } from '@/components/chat/incoming-voice-call-dialog';
import { useCallback } from 'react';
import { useUser } from '@/firebase';

/**
 * Global call dialogs that render across all pages.
 * This component is placed in the root AppLayout.
 */
export function GlobalCallDialogs() {
  const {
    currentCall,
    incomingVoiceCallFrom,
    acceptedVoiceCallContact,
    incomingCallFrom,
    acceptedCallContact,
    isVoiceCallOpen,
    setIsVoiceCallOpen,
    isVideoCallOpen,
    setIsVideoCallOpen,
    acceptVoiceCall,
    declineVoiceCall,
    acceptCall,
    declineCall,
    selectedContact,
    allContacts,
  } = useChat();

  const { user: firebaseUser } = useUser();

  // Determine which contact to show in the call dialog
  const getCallContact = useCallback(() => {
    if (!currentCall || !firebaseUser) return null;

    // For accepted calls
    if (acceptedCallContact && currentCall.type === 'video') return acceptedCallContact;
    if (acceptedVoiceCallContact && currentCall.type === 'voice') return acceptedVoiceCallContact;
    
    // For incoming calls
    if (incomingCallFrom && currentCall.type === 'video') return incomingCallFrom;
    if (incomingVoiceCallFrom && currentCall.type === 'voice') return incomingVoiceCallFrom;
    
    // For outgoing calls (when YOU initiated the call)
    if (currentCall.callerId === firebaseUser.uid) {
      const otherParticipantId = currentCall.recipientId;
      return allContacts.find(c => c.id === otherParticipantId) || null;
    }
    
    // Fallback to selected contact
    if (selectedContact && currentCall.participantIds?.includes(selectedContact.id)) {
      return selectedContact;
    }
    
    return null;
  }, [
    acceptedCallContact, 
    acceptedVoiceCallContact, 
    incomingCallFrom, 
    incomingVoiceCallFrom, 
    currentCall, 
    selectedContact,
    allContacts,
    firebaseUser
  ]);

  const callContact = getCallContact();

  if (!currentCall || !callContact) return null;

  // Determine if this is an incoming call (for the current user)
  const isIncomingVideoCall = currentCall.type === 'video' && 
    currentCall.recipientId === firebaseUser?.uid && 
    currentCall.status === 'ringing';
    
  const isIncomingVoiceCall = currentCall.type === 'voice' && 
    currentCall.recipientId === firebaseUser?.uid && 
    currentCall.status === 'ringing';

  // Show active video call (during call or ringing out)
  const showActiveVideoCall = isVideoCallOpen && currentCall.type === 'video' && !isIncomingVideoCall;
  
  // Show active voice call (during call or ringing out)
  const showActiveVoiceCall = isVoiceCallOpen && currentCall.type === 'voice' && !isIncomingVoiceCall;

  return (
    <>
      {/* Active Video Call (outgoing or accepted) */}
      {showActiveVideoCall && (
        <VideoCallDialog
          isOpen={true}
          onClose={() => setIsVideoCallOpen(false)}
          contact={callContact}
          isReceivingCall={false}
        />
      )}

      {/* Active Voice Call (outgoing or accepted) */}
      {showActiveVoiceCall && (
        <VoiceCallDialog
          isOpen={true}
          onClose={() => setIsVoiceCallOpen(false)}
          contact={callContact}
          isReceivingCall={false}
        />
      )}

      {/* Incoming Video Call (ringing - need to accept/decline) */}
      {isIncomingVideoCall && (
        <IncomingCallDialog
          isOpen={true}
          onClose={declineCall}
          onAccept={() => {
            acceptCall();
            setIsVideoCallOpen(true);
          }}
          onDecline={declineCall}
          contact={callContact}
        />
      )}

      {/* Incoming Voice Call (ringing - need to accept/decline) */}
      {isIncomingVoiceCall && (
        <IncomingVoiceCallDialog
          isOpen={true}
          onClose={declineVoiceCall}
          onAccept={() => {
            acceptVoiceCall();
            setIsVoiceCallOpen(true);
          }}
          onDecline={declineVoiceCall}
          contact={callContact}
        />
      )}
    </>
  );
}