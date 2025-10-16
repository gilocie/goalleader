'use client';

import { useChat } from '@/context/chat-context';
import { VoiceCallDialog } from '@/components/chat/voice-call-dialog';
import { VideoCallDialog } from '@/components/chat/video-call-dialog';
import { IncomingCallDialog } from '@/components/chat/incoming-call-dialog';
import { IncomingVoiceCallDialog } from '@/components/chat/incoming-voice-call-dialog';
import { useCallback } from 'react';

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
  } = useChat();

  // Determine which contact to show in the call dialog
  const getCallContact = useCallback(() => {
    if (acceptedCallContact && currentCall?.type === 'video') return acceptedCallContact;
    if (acceptedVoiceCallContact && currentCall?.type === 'voice') return acceptedVoiceCallContact;
    if (incomingCallFrom && currentCall?.type === 'video') return incomingCallFrom;
    if (incomingVoiceCallFrom && currentCall?.type === 'voice') return incomingVoiceCallFrom;
    if (selectedContact && currentCall?.participantIds?.includes(selectedContact.id)) return selectedContact;
    return null;
  }, [acceptedCallContact, acceptedVoiceCallContact, incomingCallFrom, incomingVoiceCallFrom, currentCall, selectedContact]);

  const callContact = getCallContact();

  // Show active video call dialog (after accepting or when calling)
  const showActiveVideoCall = isVideoCallOpen && callContact && currentCall && currentCall.type === 'video';
  
  // Show active voice call dialog (after accepting or when calling)
  const showActiveVoiceCall = isVoiceCallOpen && callContact && currentCall && currentCall.type === 'voice';
  
  // Show incoming video call dialog (before accepting)
  const showIncomingVideoCall = incomingCallFrom && !isVideoCallOpen && currentCall?.status === 'ringing' && currentCall.type === 'video';
  
  // Show incoming voice call dialog (before accepting)
  const showIncomingVoiceCall = incomingVoiceCallFrom && !isVoiceCallOpen && currentCall?.status === 'ringing' && currentCall.type === 'voice';

  return (
    <>
      {/* Active Video Call (during call) */}
      {showActiveVideoCall && (
        <VideoCallDialog
          isOpen={true}
          onClose={() => setIsVideoCallOpen(false)}
          contact={callContact}
          isReceivingCall={!!incomingCallFrom && currentCall.status === 'ringing'}
        />
      )}

      {/* Active Voice Call (during call) */}
      {showActiveVoiceCall && (
        <VoiceCallDialog
          isOpen={true}
          onClose={() => setIsVoiceCallOpen(false)}
          contact={callContact}
          isReceivingCall={!!incomingVoiceCallFrom && currentCall.status === 'ringing'}
        />
      )}

      {/* Incoming Video Call (ringing) */}
      {showIncomingVideoCall && (
        <IncomingCallDialog
          isOpen={true}
          onClose={declineCall}
          onAccept={() => {
            acceptCall();
            setIsVideoCallOpen(true);
          }}
          onDecline={declineCall}
          contact={incomingCallFrom}
        />
      )}

      {/* Incoming Voice Call (ringing) */}
      {showIncomingVoiceCall && (
        <IncomingVoiceCallDialog
          isOpen={true}
          onClose={declineVoiceCall}
          onAccept={() => {
            acceptVoiceCall();
            setIsVoiceCallOpen(true);
          }}
          onDecline={declineVoiceCall}
          contact={incomingVoiceCallFrom}
        />
      )}
    </>
  );
}