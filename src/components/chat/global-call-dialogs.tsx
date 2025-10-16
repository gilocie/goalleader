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

  const getCallContact = useCallback(() => {
    if (acceptedCallContact && currentCall?.type === 'video') return acceptedCallContact;
    if (acceptedVoiceCallContact && currentCall?.type === 'voice') return acceptedVoiceCallContact;
    if (incomingCallFrom && currentCall?.type === 'video') return incomingCallFrom;
    if (incomingVoiceCallFrom && currentCall?.type === 'voice') return incomingVoiceCallFrom;
    if (selectedContact && (currentCall?.participantIds.includes(selectedContact.id))) return selectedContact;
    return null;
  }, [acceptedCallContact, acceptedVoiceCallContact, incomingCallFrom, incomingVoiceCallFrom, currentCall, selectedContact]);

  const callContact = getCallContact();

  return (
    <>
      {isVideoCallOpen && callContact && currentCall && (
        <VideoCallDialog
          isOpen={isVideoCallOpen}
          onClose={() => setIsVideoCallOpen(false)}
          contact={callContact}
          isReceivingCall={!!incomingCallFrom && currentCall.status === 'ringing'}
        />
      )}

      {isVoiceCallOpen && callContact && currentCall && (
        <VoiceCallDialog
          isOpen={isVoiceCallOpen}
          onClose={() => setIsVoiceCallOpen(false)}
          contact={callContact}
          isReceivingCall={!!incomingVoiceCallFrom && currentCall.status === 'ringing'}
        />
      )}

      {incomingCallFrom && !isVideoCallOpen && currentCall?.status === 'ringing' && (
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

      {incomingVoiceCallFrom && !isVoiceCallOpen && currentCall?.status === 'ringing' && (
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
