
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
  const [localCallEnded, setLocalCallEnded] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [hasAccepted, setHasAccepted] = useState(false); // Track if we've accepted

  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const webrtcServiceRef = useRef<WebRTCService | null>(null);
  const initializationAttemptedRef = useRef(false); // Prevent double initialization
  
  const { toast } = useToast();
  const firestore = useFirestore();
  const { currentCall, endVoiceCall, acceptVoiceCall, self } = useChat();

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
    if (webrtcServiceRef.current) {
        webrtcServiceRef.current.cleanup();
        webrtcServiceRef.current = null;
    }
    if (currentCall && !localCallEnded) {
        setLocalCallEnded(true);
        endVoiceCall(contact.id);
    }
    initializationAttemptedRef.current = false;
    setHasAccepted(false);
    onClose();
  }, [currentCall, contact.id, endVoiceCall, localCallEnded, onClose]);

  // Timer for elapsed time
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen && isActive && isConnected) {
      setElapsedTime(0);
      timer = setInterval(() => setElapsedTime((t) => t + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, isActive, isConnected]);

  const handleRemoteStream = useCallback((stream: MediaStream) => {
    console.log('[VoiceCallDialog] Received remote stream');
    if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = stream;
    }
  }, []);

  const handleConnectionStateChange = useCallback((state: RTCPeerConnectionState) => {
    console.log('[VoiceCallDialog] Connection state changed:', state);
    setConnectionState(state);
  }, []);

  // Initialize WebRTC when appropriate
  useEffect(() => {
    if (!firestore || !self || !currentCall || !contact) {
      console.log('[VoiceCallDialog] Missing required data for initialization');
      return;
    }

    // Determine if we should initialize
    const isInitiator = currentCall.callerId === self.id;
    const shouldInitialize = isInitiator || (isActive && (hasAccepted || !isReceivingCall));

    console.log('[VoiceCallDialog] Initialization check:', {
      isInitiator,
      isActive,
      hasAccepted,
      isReceivingCall,
      shouldInitialize,
      alreadyHasService: !!webrtcServiceRef.current,
      isInitializing,
      initializationAttempted: initializationAttemptedRef.current
    });

    if (!shouldInitialize) {
      console.log('[VoiceCallDialog] Waiting for call to be accepted or activated');
      return;
    }

    if (webrtcServiceRef.current) {
      console.log('[VoiceCallDialog] WebRTC service already exists');
      return;
    }

    if (isInitializing || initializationAttemptedRef.current) {
      console.log('[VoiceCallDialog] Already initializing or attempted');
      return;
    }

    const initializeWebRTC = async () => {
        initializationAttemptedRef.current = true;
        setIsInitializing(true);
        
        try {
            console.log('[VoiceCallDialog] Creating WebRTC service, Role:', isInitiator ? 'Initiator' : 'Receiver');
            const service = new WebRTCService(firestore, currentCall.id, self.id, isInitiator);
            webrtcServiceRef.current = service;

            // Small delay for receiver to ensure offer is in Firestore
            if (!isInitiator) {
              console.log('[VoiceCallDialog] Receiver waiting 500ms for offer to be ready...');
              await new Promise(resolve => setTimeout(resolve, 500));
            }

            console.log('[VoiceCallDialog] Initializing WebRTC service');
            const stream = await service.initialize(
                handleRemoteStream,
                handleConnectionStateChange,
                { audio: true, video: false }
            );

            if (stream) {
                console.log('[VoiceCallDialog] WebRTC initialized successfully');
            } else {
                console.warn('[VoiceCallDialog] WebRTC initialization returned null');
                webrtcServiceRef.current = null;
                initializationAttemptedRef.current = false;
            }
        } catch (error: any) {
            if (!error.message?.includes('aborted')) {
                console.error('[VoiceCallDialog] Failed to initialize WebRTC:', error);
                toast({
                  variant: 'destructive',
                  title: 'Connection Error',
                  description: 'Failed to establish call connection. Please try again.',
                });
            }
            webrtcServiceRef.current = null;
            initializationAttemptedRef.current = false;
        } finally {
            setIsInitializing(false);
        }
    };

    initializeWebRTC();

    return () => {
        console.log('[VoiceCallDialog] Cleanup triggered');
        if (webrtcServiceRef.current) {
            console.log('[VoiceCallDialog] Cleaning up WebRTC service');
            webrtcServiceRef.current.cleanup();
            webrtcServiceRef.current = null;
        }
        setConnectionState('new');
    };
  }, [
    firestore, 
    self?.id, 
    currentCall?.id,
    currentCall?.status,
    currentCall?.callerId,
    contact?.id,
    isReceivingCall,
    hasAccepted,
    handleRemoteStream, 
    handleConnectionStateChange,
    toast
  ]);

  // Handle accepting incoming call
  const handleAcceptCall = useCallback(async () => {
    if (!currentCall || !isReceivingCall) return;
    
    try {
      console.log('[VoiceCallDialog] Accepting call');
      setHasAccepted(true);
      await acceptVoiceCall();
      console.log('[VoiceCallDialog] Call accepted, will initialize WebRTC');
    } catch (error) {
      console.error('Failed to accept call:', error);
      setHasAccepted(false);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to accept call.',
      });
    }
  }, [currentCall, isReceivingCall, acceptVoiceCall, toast]);

  // Toggle microphone
  const toggleMic = useCallback(() => {
    if (webrtcServiceRef.current) {
        const audioTracks = webrtcServiceRef.current.getLocalStream()?.getAudioTracks();
        const currentlyEnabled = audioTracks && audioTracks[0]?.enabled;
        webrtcServiceRef.current.toggleAudio(!currentlyEnabled);
        setIsMuted(currentlyEnabled || false);
    }
  }, []);

  // Toggle speaker
  const toggleSpeaker = useCallback(() => {
    if (remoteAudioRef.current) {
      remoteAudioRef.current.muted = !isSpeakerMuted;
      setIsSpeakerMuted(!isSpeakerMuted);
    }
  }, [isSpeakerMuted]);

  const [shouldClose, setShouldClose] = useState(false);

  useEffect(() => {
    if (!currentCall || (currentCall.status !== 'ringing' && currentCall.status !== 'active')) {
        setShouldClose(true);
    } else {
        setShouldClose(false);
    }
  }, [currentCall]);

  useEffect(() => {
    if (shouldClose) {
        const timer = setTimeout(() => {
            onClose();
            setLocalCallEnded(false);
            setHasAccepted(false);
            initializationAttemptedRef.current = false;
        }, 300);
        return () => clearTimeout(timer);
    }
  }, [shouldClose, onClose]);

  useEffect(() => {
    if (isOpen && currentCall) {
        setLocalCallEnded(false);
    }
  }, [isOpen, currentCall]);

  // Display status text
  const getStatusText = () => {
    if (isReceivingCall && callStatus === 'ringing' && !hasAccepted) {
      return 'Incoming Call...';
    }
    if (isActive || hasAccepted) {
      if (isConnected) {
        return formatTime(elapsedTime);
      }
      return 'Connecting...';
    }
    return 'Calling...';
  };

  return (
    <Dialog 
        open={isOpen && !!currentCall && (currentCall.status === 'ringing' || currentCall.status === 'active')}
        onOpenChange={(open) => {
            if (!open) {
                handleEndCall();
            }
        }}
    >
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-gray-900 to-gray-800 text-white border-0 shadow-2xl p-8">
        <DialogHeader className="sr-only">
          <DialogTitle>Voice Call with {contact.name}</DialogTitle>
          <DialogDescription>Voice call interface</DialogDescription>
        </DialogHeader>

        <audio 
            ref={remoteAudioRef}
            autoPlay
            playsInline
        />

        <div className="flex flex-col items-center justify-center space-y-6">
          <Avatar className="h-40 w-40 border-4 border-purple-500/30 shadow-lg shadow-purple-500/20 ring-2 ring-purple-400/20">
            <AvatarImage 
              src={contactAvatar?.imageUrl} 
              data-ai-hint={contactAvatar?.imageHint} 
            />
            <AvatarFallback className="text-5xl bg-gradient-to-br from-purple-600 to-blue-600">
              {contact.name.slice(0, 2)}
            </AvatarFallback>
          </Avatar>

          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">{contact.name}</h2>
            
            <div className="flex items-center justify-center gap-2">
              {isInitializing && <Loader2 className="h-5 w-5 animate-spin text-purple-400" />}
              {isConnected && isActive && (
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              )}
              <p className={cn(
                "text-lg font-medium",
                isReceivingCall && callStatus === 'ringing' && !hasAccepted ? "text-green-400 animate-pulse" : "text-gray-300",
                isConnected ? "font-mono tabular-nums" : ""
              )}>
                {getStatusText()}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 pt-8">
            {isReceivingCall && callStatus === 'ringing' && !hasAccepted ? (
              <>
                <Button
                  onClick={handleEndCall}
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
                  disabled={!isActive && !hasAccepted}
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
                  disabled={!isActive && !hasAccepted}
                >
                  {isSpeakerMuted ? <VolumeX className="h-7 w-7" /> : <Volume2 className="h-7 w-7" />}
                </Button>
              </>
            )}
          </div>

          {(isActive || hasAccepted) && !isConnected && (
            <div className="text-sm text-gray-400 flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '300ms'
                }} />
              </div>
              Establishing connection...
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
