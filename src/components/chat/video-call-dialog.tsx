'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Phone, Video, VideoOff, Maximize, Minimize, Loader2, FlipHorizontal } from 'lucide-react';
import type { Contact } from '@/types/chat';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useChat } from '@/context/chat-context';
import { WebRTCService } from '@/lib/webrtc-service';
import { useFirestore } from '@/firebase';

interface VideoCallDialogProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact;
  isReceivingCall?: boolean;
}

export function VideoCallDialog({ 
  isOpen, 
  onClose, 
  contact, 
  isReceivingCall = false 
}: VideoCallDialogProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState>('new');
  const [localCallEnded, setLocalCallEnded] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [hasAccepted, setHasAccepted] = useState(false);
  const [isMirrored, setIsMirrored] = useState(true);


  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const webrtcServiceRef = useRef<WebRTCService | null>(null);
  const initializationAttemptedRef = useRef(false);
  
  const { toast } = useToast();
  const firestore = useFirestore();
  const { currentCall, endCall, acceptCall, self } = useChat();

  const contactAvatar = PlaceHolderImages.find((img) => img.id === contact.id);
  const selfAvatar = self ? PlaceHolderImages.find((img) => img.id === self.id) : undefined;
  
  const callStatus = currentCall?.status || 'ringing';
  const isActive = callStatus === 'active';
  const isConnected = connectionState === 'connected';

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
        endCall(contact.id);
    }
    initializationAttemptedRef.current = false;
    setHasAccepted(false);
    onClose();
  }, [currentCall, contact.id, endCall, localCallEnded, onClose]);


  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen && isActive && isConnected) {
      setElapsedTime(0);
      timer = setInterval(() => setElapsedTime((t) => t + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, isActive, isConnected]);

  const handleRemoteStream = useCallback((stream: MediaStream) => {
    console.log('[VideoCallDialog] Received remote stream');
    if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
    }
  }, []);

  const handleConnectionStateChange = useCallback((state: RTCPeerConnectionState) => {
      console.log('[VideoCallDialog] Connection state changed:', state);
      setConnectionState(state);
  }, []);

  useEffect(() => {
    if (!firestore || !self || !currentCall || !contact) {
      console.log('[VideoCallDialog] Missing required data for initialization');
      return;
    }

    const isInitiator = currentCall.callerId === self.id;
    const shouldInitialize = isInitiator || (isActive && (hasAccepted || !isReceivingCall));
    
    console.log('[VideoCallDialog] Initialization check:', {
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
      console.log('[VideoCallDialog] Waiting for call to be accepted or activated');
      return;
    }

    if (webrtcServiceRef.current) {
        console.log('[VideoCallDialog] WebRTC service already exists');
        return;
    }

    if (isInitializing || initializationAttemptedRef.current) {
        console.log('[VideoCallDialog] Already initializing or attempted');
        return;
    }

    const initializeWebRTC = async () => {
        initializationAttemptedRef.current = true;
        setIsInitializing(true);
        try {
            console.log('[VideoCallDialog] Creating WebRTC service, Role:', isInitiator ? 'Initiator' : 'Receiver');
            const service = new WebRTCService(firestore, currentCall.id, self.id, isInitiator);
            webrtcServiceRef.current = service;

            if (!isInitiator) {
              console.log('[VideoCallDialog] Receiver waiting 500ms for offer to be ready...');
              await new Promise(resolve => setTimeout(resolve, 500));
            }

            console.log('[VideoCallDialog] Initializing WebRTC service');
            const stream = await service.initialize(
                handleRemoteStream,
                handleConnectionStateChange,
                { audio: true, video: true }
            );

            if (stream) {
                if (localVideoRef.current) {
                  localVideoRef.current.srcObject = stream;
                }
                console.log('[VideoCallDialog] WebRTC initialized successfully');
            } else {
                console.warn('[VideoCallDialog] WebRTC initialization returned null (likely aborted)');
                webrtcServiceRef.current = null;
                initializationAttemptedRef.current = false;
            }
        } catch (error: any) {
            if (!error.message?.includes('aborted')) {
                console.error('[VideoCallDialog] Failed to initialize WebRTC:', error);
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
        console.log('[VideoCallDialog] Cleanup triggered');
        if (webrtcServiceRef.current) {
            console.log('[VideoCallDialog] Cleaning up WebRTC service');
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
  
  const handleAcceptCall = useCallback(async () => {
    if (!currentCall || !isReceivingCall) return;
    
    try {
      console.log('[VideoCallDialog] Accepting call');
      setHasAccepted(true);
      await acceptCall();
      console.log('[VideoCallDialog] Call accepted, will initialize WebRTC');
    } catch (error) {
      console.error('Failed to accept call:', error);
      setHasAccepted(false);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to accept call.',
      });
    }
  }, [currentCall, isReceivingCall, acceptCall, toast]);

  const toggleMic = useCallback(() => {
    if (webrtcServiceRef.current) {
      const localStream = webrtcServiceRef.current.getLocalStream();
      const currentlyEnabled = localStream?.getAudioTracks()[0]?.enabled;
      webrtcServiceRef.current.toggleAudio(!currentlyEnabled);
      setIsMuted(!currentlyEnabled);
    }
  }, []);

  const toggleVideo = useCallback(() => {
    if (webrtcServiceRef.current) {
      const localStream = webrtcServiceRef.current.getLocalStream();
      const currentlyEnabled = localStream?.getVideoTracks()[0]?.enabled;
      webrtcServiceRef.current.toggleVideo(!currentlyEnabled);
      setIsVideoOff(!currentlyEnabled);
    }
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await containerRef.current?.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

    const [shouldClose, setShouldClose] = useState(false);

    useEffect(() => {
        if (!currentCall || (currentCall.status !== 'ringing' && currentCall.status === 'active')) {
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

  return (
    <Dialog 
        open={isOpen && !!currentCall && (currentCall.status === 'ringing' || currentCall.status === 'active')} 
        onOpenChange={(open) => {
            if (!open) {
            handleEndCall();
            }
        }}
    >
      <DialogContent 
        ref={containerRef}
        className="max-w-full h-screen w-screen p-0 gap-0 text-white border-0 sm:rounded-none flex flex-col bg-black"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Video Call with {contact.name}</DialogTitle>
          <DialogDescription>Video call interface</DialogDescription>
        </DialogHeader>

        <div className="relative flex-1 overflow-hidden">
          <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
            {/* Background: Local Video or Fallback */}
            {isVideoOff ? (
              <div className="h-full w-full flex flex-col items-center justify-center bg-gray-800">
                <Avatar className="h-40 w-40">
                  <AvatarImage src={selfAvatar?.imageUrl} data-ai-hint={selfAvatar?.imageHint} />
                  <AvatarFallback className="text-5xl">
                    {self?.name?.slice(0, 2) || 'ME'}
                  </AvatarFallback>
                </Avatar>
              </div>
            ) : (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={cn("w-full h-full object-cover", isMirrored && "transform scale-x-[-1]")}
              />
            )}
            
            {/* Central Info Overlay (when not connected) */}
            {!isConnected && (
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-4">
                <Avatar className="h-40 w-40 border-4 border-purple-500/30">
                  <AvatarImage src={contactAvatar?.imageUrl} data-ai-hint={contactAvatar?.imageHint} />
                  <AvatarFallback className="text-5xl bg-gradient-to-br from-purple-600 to-blue-600">
                    {contact.name.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">{contact.name}</h2>
                   {isInitializing && (
                     <p className="text-gray-400 flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Initializing...
                    </p>
                  )}
                  {(isActive || hasAccepted) && !isConnected && !isInitializing && (
                    <p className="text-gray-400 flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Connecting...
                    </p>
                  )}
                  {isReceivingCall && callStatus === 'ringing' && !hasAccepted && (
                    <p className="text-green-400 text-lg font-semibold animate-pulse">
                      Incoming Call...
                    </p>
                  )}
                  {!isActive && !isReceivingCall && (
                    <p className="text-gray-400 flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Calling...
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Remote Video (PiP) - Only appears when connected */}
          {isConnected && (
            <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden shadow-2xl border-2 border-white/20 z-10">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-1 left-1 text-xs bg-black/50 px-2 py-0.5 rounded">
                {contact.name}
              </div>
            </div>
          )}


          {isActive && isConnected && (
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 backdrop-blur-sm text-white px-3 py-1.5 rounded-full z-10">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="font-mono text-sm tabular-nums">{formatTime(elapsedTime)}</span>
            </div>
          )}

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20">
            {isReceivingCall && callStatus === 'ringing' && !hasAccepted ? (
              <>
                <Button
                  onClick={handleEndCall}
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
                  size="icon"
                  className={cn(
                    'rounded-full h-14 w-14 transition-all shadow-lg',
                    isMuted 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-white/20 hover:bg-white/30'
                  )}
                  disabled={!isActive && !hasAccepted}
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                </Button>

                <Button
                  onClick={toggleVideo}
                  size="icon"
                  className={cn(
                    'rounded-full h-14 w-14 transition-all shadow-lg',
                    isVideoOff 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-white/20 hover:bg-white/30'
                  )}
                  disabled={!isActive && !hasAccepted}
                  aria-label={isVideoOff ? "Turn on camera" : "Turn off camera"}
                >
                  {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
                </Button>

                <Button
                  onClick={handleEndCall}
                  size="icon"
                  className="rounded-full h-16 w-16 bg-red-600 hover:bg-red-700 shadow-lg"
                  aria-label="End call"
                >
                  <Phone className="h-7 w-7 rotate-[135deg]" />
                </Button>

                <Button
                  onClick={() => setIsMirrored(!isMirrored)}
                  size="icon"
                  variant="secondary"
                  className="rounded-full h-12 w-12 bg-white/20 hover:bg-white/30"
                  disabled={isVideoOff}
                  aria-label="Mirror video"
                >
                  <FlipHorizontal className="h-5 w-5" />
                </Button>

                <Button
                  onClick={toggleFullscreen}
                  size="icon"
                  className="rounded-full h-14 w-14 bg-white/20 hover:bg-white/30 shadow-lg"
                  aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                >
                  {isFullscreen ? <Minimize className="h-6 w-6" /> : <Maximize className="h-6 w-6" />}
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
