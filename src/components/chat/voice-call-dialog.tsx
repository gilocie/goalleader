

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Phone, Volume2, VolumeX, Loader2 } from 'lucide-react';
import type { Contact } from '@/types/chat';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useChat } from '@/context/chat-context';
import { WebRTCService } from '@/lib/webrtc-service';
import { useFirestore } from '@/firebase';

interface VoiceCallDialogProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact;
  isReceivingCall?: boolean;
}

export function VoiceCallDialog({ 
  isOpen, 
  onClose, 
  contact, 
  isReceivingCall = false 
}: VoiceCallDialogProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState>('new');

  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const webrtcServiceRef = useRef<WebRTCService | null>(null);
  
  const { toast } = useToast();
  const firestore = useFirestore();
  const { currentCall, endVoiceCall, acceptVoiceCall, declineVoiceCall, self } = useChat();

  const contactAvatar = PlaceHolderImages.find((img) => img.id === contact.id);
  const callStatus = currentCall?.status || 'ringing';
  const isActive = callStatus === 'active';
  const isConnected = connectionState === 'connected';

  // Format elapsed time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = useCallback(() => {
    webrtcServiceRef.current?.cleanup();
    
    if (currentCall) {
      endVoiceCall(contact.id);
    }
    
    onClose();
  }, [currentCall, contact.id, endVoiceCall, onClose]);

  // Timer for elapsed time
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen && isActive && isConnected) {
      setElapsedTime(0);
      timer = setInterval(() => setElapsedTime((t) => t + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, isActive, isConnected]);

  // Initialize WebRTC when call becomes active
  useEffect(() => {
    if (!isOpen || !currentCall || !firestore || !self) return;
    if (callStatus !== 'active') return;

    const initializeWebRTC = async () => {
      try {
        const isInitiator = currentCall.callerId === self.id;
        webrtcServiceRef.current = new WebRTCService(
          firestore,
          currentCall.id,
          self.id,
          isInitiator
        );

        await webrtcServiceRef.current.initialize(
          // On remote stream
          (remoteStream) => {
            console.log('Remote audio stream received');
            if (remoteAudioRef.current && remoteStream.getAudioTracks().length > 0) {
              remoteAudioRef.current.srcObject = remoteStream;
            }
          },
          // On connection state change
          (state) => {
            console.log('Connection state:', state);
            setConnectionState(state);
            
            if (state === 'disconnected' || state === 'failed' || state === 'closed') {
              handleEndCall();
            }
          },
          // Media constraints (audio only for voice call)
          { audio: true, video: false }
        );

        console.log('WebRTC initialized successfully');
      } catch (error) {
        console.error('Failed to initialize WebRTC:', error);
        toast({
          variant: 'destructive',
          title: 'Call Failed',
          description: 'Could not establish voice connection.',
        });
        handleEndCall();
      }
    };

    initializeWebRTC();

    return () => {
      webrtcServiceRef.current?.cleanup();
      webrtcServiceRef.current = null;
    };
  }, [isOpen, currentCall, callStatus, firestore, self, toast, handleEndCall]);

  // Handle accepting incoming call
  const handleAcceptCall = useCallback(async () => {
    if (!currentCall || !isReceivingCall) return;
    
    try {
      await acceptVoiceCall();
      // WebRTC will initialize when callStatus changes to 'active'
    } catch (error) {
      console.error('Failed to accept call:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to accept call.',
      });
    }
  }, [currentCall, isReceivingCall, acceptVoiceCall, toast]);

  // Handle declining incoming call
  const handleDeclineCall = useCallback(async () => {
    if (!currentCall || !isReceivingCall) return;
    
    try {
      await declineVoiceCall();
      onClose();
    } catch (error) {
      console.error('Failed to decline call:', error);
    }
  }, [currentCall, isReceivingCall, declineVoiceCall, onClose]);

  // Toggle microphone
  const toggleMic = useCallback(() => {
    if (webrtcServiceRef.current) {
      const newMutedState = !isMuted;
      webrtcServiceRef.current.toggleAudio(!newMutedState);
      setIsMuted(newMutedState);
    }
  }, [isMuted]);

  // Toggle speaker
  const toggleSpeaker = useCallback(() => {
    if (remoteAudioRef.current) {
      remoteAudioRef.current.muted = !isSpeakerMuted;
      setIsSpeakerMuted(!isSpeakerMuted);
    }
  }, [isSpeakerMuted]);

  // Auto-close if call ends remotely
  useEffect(() => {
    if (callStatus === 'ended' || callStatus === 'declined') {
      toast({
        title: callStatus === 'declined' ? 'Call Declined' : 'Call Ended',
        description: `The call with ${contact.name} has ended.`,
      });
      setTimeout(() => onClose(), 1000);
    }
  }, [callStatus, contact.name, onClose, toast]);

  // Display status text
  const getStatusText = () => {
    if (isReceivingCall && callStatus === 'ringing') {
      return 'Incoming Call...';
    }
    if (isActive) {
      if (isConnected) {
        return formatTime(elapsedTime);
      }
      return 'Connecting...';
    }
    return 'Calling...';
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleEndCall}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-gray-900 to-gray-800 text-white border-0 shadow-2xl p-8">
        <DialogHeader className="sr-only">
          <DialogTitle>Voice Call with {contact.name}</DialogTitle>
          <DialogDescription>Voice call interface</DialogDescription>
        </DialogHeader>

        {/* Hidden audio element for remote stream */}
        <audio ref={remoteAudioRef} autoPlay playsInline />

        <div className="flex flex-col items-center justify-center space-y-6">
          {/* Contact Avatar */}
          <Avatar className="h-40 w-40 border-4 border-purple-500/30 shadow-lg shadow-purple-500/20 ring-2 ring-purple-400/20">
            <AvatarImage 
              src={contactAvatar?.imageUrl} 
              data-ai-hint={contactAvatar?.imageHint} 
            />
            <AvatarFallback className="text-5xl bg-gradient-to-br from-purple-600 to-blue-600">
              {contact.name.slice(0, 2)}
            </AvatarFallback>
          </Avatar>

          {/* Contact Info & Status */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">{contact.name}</h2>
            
            <div className="flex items-center justify-center gap-2">
              {!isConnected && isActive && (
                <Loader2 className="h-5 w-5 animate-spin text-purple-400" />
              )}
              {isConnected && isActive && (
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              )}
              <p className={cn(
                "text-lg font-medium",
                isReceivingCall && callStatus === 'ringing' ? "text-green-400 animate-pulse" : "text-gray-300",
                isConnected ? "font-mono tabular-nums" : ""
              )}>
                {getStatusText()}
              </p>
            </div>
          </div>

          {/* Call Controls */}
          <div className="flex items-center justify-center gap-6 pt-8">
            {isReceivingCall && callStatus === 'ringing' ? (
              // Incoming call buttons
              <>
                <Button
                  onClick={handleDeclineCall}
                  variant="destructive"
                  size="icon"
                  className="rounded-full h-16 w-16 bg-red-600 hover:bg-red-700 shadow-lg"
                  aria-label="Decline call"
                >
                  <Phone className="h-7 w-7 rotate-[135deg]" />
                </Button>
                <Button
                  onClick={handleAcceptCall}
                  size="icon"
                  className="rounded-full h-16 w-16 bg-green-600 hover:bg-green-700 shadow-lg"
                  aria-label="Accept call"
                >
                  <Phone className="h-7 w-7" />
                </Button>
              </>
            ) : (
              // Active call controls
              <>
                <Button
                  onClick={toggleMic}
                  variant="secondary"
                  size="icon"
                  className={cn(
                    'rounded-full h-16 w-16 transition-all shadow-lg',
                    isMuted 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  )}
                  aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
                  disabled={!isActive}
                >
                  {isMuted ? <MicOff className="h-7 w-7" /> : <Mic className="h-7 w-7" />}
                </Button>

                <Button
                  onClick={handleEndCall}
                  variant="destructive"
                  size="icon"
                  className="rounded-full h-16 w-16 bg-red-600 hover:bg-red-700 shadow-lg"
                  aria-label="End call"
                >
                  <Phone className="h-7 w-7 rotate-[135deg]" />
                </Button>

                <Button
                  onClick={toggleSpeaker}
                  variant="secondary"
                  size="icon"
                  className={cn(
                    'rounded-full h-16 w-16 transition-all shadow-lg',
                    isSpeakerMuted 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  )}
                  aria-label={isSpeakerMuted ? "Unmute speaker" : "Mute speaker"}
                  disabled={!isActive}
                >
                  {isSpeakerMuted ? <VolumeX className="h-7 w-7" /> : <Volume2 className="h-7 w-7" />}
                </Button>
              </>
            )}
          </div>

          {/* Connection indicator */}
          {isActive && !isConnected && (
            <div className="text-sm text-gray-400 flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              Establishing connection...
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
