
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Phone, Video, VideoOff, Maximize, Minimize, Loader2, SwitchCamera } from 'lucide-react';
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [localCallEnded, setLocalCallEnded] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [hasAccepted, setHasAccepted] = useState(false);
  const [isSwapped, setIsSwapped] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  // Separate refs for main and PiP videos
  const localVideoMainRef = useRef<HTMLVideoElement | null>(null);
  const localVideoPipRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoMainRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoPipRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const webrtcServiceRef = useRef<WebRTCService | null>(null);
  const initializationAttemptedRef = useRef(false);
  const previewStreamRef = useRef<MediaStream | null>(null);
  
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

  // Get preview camera immediately when dialog opens
  useEffect(() => {
    if (!isOpen) return;

    const getPreviewCamera = async () => {
      try {
        console.log('[VideoCallDialog] Getting preview camera...');
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: true, 
          video: true 
        });
        console.log('[VideoCallDialog] Got preview camera');
        previewStreamRef.current = stream;
        setLocalStream(stream);
      } catch (error) {
        console.error('[VideoCallDialog] Failed to get preview camera:', error);
        toast({
          variant: 'destructive',
          title: 'Camera Error',
          description: 'Failed to access camera. Please check permissions.',
        });
      }
    };

    getPreviewCamera();

    return () => {
      if (previewStreamRef.current && !webrtcServiceRef.current) {
        console.log('[VideoCallDialog] Cleaning up preview camera');
        previewStreamRef.current.getTracks().forEach(track => track.stop());
        previewStreamRef.current = null;
      }
    };
  }, [isOpen, toast]);

  // Update ALL video elements when streams or swap state changes
  useEffect(() => {
    console.log('[VideoCallDialog] Updating video assignments - Swapped:', isSwapped, 'Local:', !!localStream, 'Remote:', !!remoteStream, 'Connected:', isConnected);
    
    // Assign local stream to its potential elements
    if (localVideoMainRef.current && localStream) {
        localVideoMainRef.current.srcObject = localStream;
    }
    if (localVideoPipRef.current && localStream) {
        localVideoPipRef.current.srcObject = localStream;
    }

    // Assign remote stream to its potential elements
    if (remoteVideoMainRef.current && remoteStream) {
        remoteVideoMainRef.current.srcObject = remoteStream;
    }
    if (remoteVideoPipRef.current && remoteStream) {
        remoteVideoPipRef.current.srcObject = remoteStream;
    }
    
  }, [localStream, remoteStream, isSwapped, isVideoOff, isConnected]);

  const handleRemoteStream = useCallback((stream: MediaStream) => {
    console.log('[VideoCallDialog] ✅ Received remote stream with tracks:', {
      audio: stream.getAudioTracks().length,
      video: stream.getVideoTracks().length
    });
    setRemoteStream(stream);
  }, []);
  
  const handleEndCall = useCallback(() => {
    if (webrtcServiceRef.current) {
        webrtcServiceRef.current.cleanup();
        webrtcServiceRef.current = null;
    }
    
    if (previewStreamRef.current) {
      previewStreamRef.current.getTracks().forEach(track => track.stop());
      previewStreamRef.current = null;
    }
    
    if (currentCall && !localCallEnded) {
        setLocalCallEnded(true);
        endCall(contact.id);
    }
    
    initializationAttemptedRef.current = false;
    setHasAccepted(false);
    setIsSwapped(false);
    setLocalStream(null);
    setRemoteStream(null);
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

  const handleConnectionStateChange = useCallback((state: RTCPeerConnectionState) => {
      console.log('[VideoCallDialog] Connection state changed:', state);
      setConnectionState(state);
  }, []);

  useEffect(() => {
    if (!firestore || !self || !currentCall || !contact) {
      return;
    }

    const isInitiator = currentCall.callerId === self.id;
    const shouldInitialize = isInitiator || (isActive && (hasAccepted || !isReceivingCall));
    
    if (!shouldInitialize || webrtcServiceRef.current || isInitializing || initializationAttemptedRef.current) {
      return;
    }

    const initializeWebRTC = async () => {
        initializationAttemptedRef.current = true;
        setIsInitializing(true);
        try {
            const service = new WebRTCService(firestore, currentCall.id, self.id, isInitiator);
            webrtcServiceRef.current = service;

            if (!isInitiator) {
              await new Promise(resolve => setTimeout(resolve, 500));
            }

            const stream = await service.initialize(
                handleRemoteStream,
                handleConnectionStateChange,
                { audio: true, video: true }
            );

            if (stream) {
                if (previewStreamRef.current) {
                  previewStreamRef.current.getTracks().forEach(track => track.stop());
                  previewStreamRef.current = null;
                }
                setLocalStream(stream);
            } else {
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
        if (webrtcServiceRef.current) {
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
      setHasAccepted(true);
      await acceptCall();
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
    const stream = webrtcServiceRef.current?.getLocalStream() || localStream;
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  }, [localStream]);

  const toggleVideo = useCallback(() => {
    const stream = webrtcServiceRef.current?.getLocalStream() || localStream;
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  }, [localStream]);

  const swapCameras = useCallback(() => {
    console.log('[VideoCallDialog] Swapping cameras');
    setIsSwapped(prev => !prev);
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
    if (!currentCall || (currentCall.status !== 'ringing' && currentCall.status !== 'active')) {
        setShouldClose(true);
    } else {
        setShouldClose(false);
    }
  }, [currentCall]);

  useEffect(() => {
    if (shouldClose) {
        const timer = setTimeout(() => {
            handleEndCall();
        }, 300);
        return () => clearTimeout(timer);
    }
  }, [shouldClose, handleEndCall]);

  useEffect(() => {
    if (isOpen && currentCall) {
        setLocalCallEnded(false);
    }
  }, [isOpen, currentCall]);

  // Determine if we should show the overlay
  const showOverlay = !isConnected && (
    (isReceivingCall && callStatus === 'ringing' && !hasAccepted) || // Incoming call not yet accepted
    (!isReceivingCall && callStatus === 'ringing') // Outgoing call ringing
  );

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
          {/* MAIN VIDEO (Large) */}
          <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
            {!isSwapped ? (
              // Main: Local Video
              <>
                {isVideoOff || !localStream ? (
                  <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                    <Avatar className="h-40 w-40 border-4 border-purple-500/30">
                      <AvatarImage src={selfAvatar?.imageUrl} data-ai-hint={selfAvatar?.imageHint} />
                      <AvatarFallback className="text-5xl bg-gradient-to-br from-purple-600 to-blue-600">
                        {self?.name?.slice(0, 2) || 'ME'}
                      </AvatarFallback>
                    </Avatar>
                    <p className="mt-4 text-xl text-gray-400">Camera Off</p>
                  </div>
                ) : (
                  <video
                    key="local-main"
                    ref={localVideoMainRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform scale-x-[-1]"
                  />
                )}
              </>
            ) : (
              // Main: Remote Video
              <>
                {remoteStream ? (
                  <video
                    key="remote-main"
                    ref={remoteVideoMainRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                    <Avatar className="h-40 w-40 border-4 border-purple-500/30">
                      <AvatarImage src={contactAvatar?.imageUrl} data-ai-hint={contactAvatar?.imageHint} />
                      <AvatarFallback className="text-5xl bg-gradient-to-br from-purple-600 to-blue-600">
                        {contact.name.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <p className="mt-4 text-xl text-gray-400">Waiting for {contact.name}...</p>
                  </div>
                )}
              </>
            )}
            
            {/* Overlay - Only show for incoming call or outgoing ringing */}
            {showOverlay && (
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-4">
                <Avatar className="h-32 w-32 border-4 border-white/20 shadow-2xl">
                  <AvatarImage src={contactAvatar?.imageUrl} data-ai-hint={contactAvatar?.imageHint} />
                  <AvatarFallback className="text-4xl bg-gradient-to-br from-purple-600 to-blue-600">
                    {contact.name.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">{contact.name}</h2>
                  {isReceivingCall && callStatus === 'ringing' && !hasAccepted && (
                    <p className="text-green-400 text-lg font-semibold animate-pulse">
                      Incoming Video Call...
                    </p>
                  )}
                  {!isReceivingCall && callStatus === 'ringing' && (
                    <p className="text-gray-300 flex items-center gap-2 justify-center">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Calling...
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* SMALL VIDEO (PiP) - Only show when connected */}
          {isConnected && (
            <div 
              onClick={swapCameras}
              className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden shadow-2xl border-2 border-white/30 z-10 cursor-pointer hover:border-purple-400 transition-all group"
            >
              {!isSwapped ? (
                // PiP: Remote Video
                <>
                  {remoteStream ? (
                    <video
                      key="remote-pip"
                      ref={remoteVideoPipRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-700">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={contactAvatar?.imageUrl} data-ai-hint={contactAvatar?.imageHint} />
                        <AvatarFallback className="text-xl">
                          {contact.name.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  )}
                </>
              ) : (
                // PiP: Local Video
                <>
                  {isVideoOff || !localStream ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-700">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={selfAvatar?.imageUrl} data-ai-hint={selfAvatar?.imageHint} />
                        <AvatarFallback className="text-xl">
                          {self?.name?.slice(0, 2) || 'ME'}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  ) : (
                    <video
                      key="local-pip"
                      ref={localVideoPipRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover transform scale-x-[-1]"
                    />
                  )}
                </>
              )}
              <div className="absolute bottom-1 left-1 text-xs bg-black/60 px-2 py-1 rounded backdrop-blur-sm">
                {isSwapped ? 'You' : contact.name}
              </div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                <SwitchCamera className="h-8 w-8 text-white drop-shadow-lg" />
              </div>
            </div>
          )}

          {/* Timer */}
          {isActive && isConnected && (
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full z-10">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="font-mono text-sm tabular-nums">{formatTime(elapsedTime)}</span>
            </div>
          )}

          {/* Controls */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20">
            {isReceivingCall && callStatus === 'ringing' && !hasAccepted ? (
              <>
                <Button
                  onClick={handleEndCall}
                  size="icon"
                  className="rounded-full h-16 w-16 bg-red-600 hover:bg-red-700 shadow-lg transition-transform hover:scale-105"
                  aria-label="Decline call"
                >
                  <Phone className="h-7 w-7 rotate-[135deg]" />
                </Button>
                <Button
                  onClick={handleAcceptCall}
                  size="icon"
                  className="rounded-full h-16 w-16 bg-green-600 hover:bg-green-700 shadow-lg transition-transform hover:scale-105"
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
                      : 'bg-white/20 hover:bg-white/30 backdrop-blur-sm'
                  )}
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
                      : 'bg-white/20 hover:bg-white/30 backdrop-blur-sm'
                  )}
                  aria-label={isVideoOff ? "Turn on camera" : "Turn off camera"}
                >
                  {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
                </Button>

                <Button
                  onClick={handleEndCall}
                  size="icon"
                  className="rounded-full h-16 w-16 bg-red-600 hover:bg-red-700 shadow-lg transition-transform hover:scale-105"
                  aria-label="End call"
                >
                  <Phone className="h-7 w-7 rotate-[135deg]" />
                </Button>

                {isConnected && (
                  <Button
                    onClick={swapCameras}
                    size="icon"
                    className="rounded-full h-14 w-14 bg-white/20 hover:bg-white/30 backdrop-blur-sm shadow-lg"
                    aria-label="Swap cameras"
                  >
                    <SwitchCamera className="h-6 w-6" />
                  </Button>
                )}

                <Button
                  onClick={toggleFullscreen}
                  size="icon"
                  className="rounded-full h-14 w-14 bg-white/20 hover:bg-white/30 backdrop-blur-sm shadow-lg"
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
