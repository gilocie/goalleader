'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Phone, Video, VideoOff, Maximize, Minimize, Loader2, SwitchCamera, FlipHorizontal } from 'lucide-react';
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
  const [isMirrored, setIsMirrored] = useState(true);

  // We only need two video refs now. Their content will be swapped.
  const mainVideoRef = useRef<HTMLVideoElement | null>(null);
  const pipVideoRef = useRef<HTMLVideoElement | null>(null);
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

  const stopAllStreams = useCallback((stream: MediaStream | null) => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  }, []);
  
  const handleEndCall = useCallback(() => {
    if (webrtcServiceRef.current) {
        webrtcServiceRef.current.cleanup();
        webrtcServiceRef.current = null;
    }
    stopAllStreams(localStream);

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
  }, [currentCall, contact.id, endCall, localCallEnded, onClose, localStream, stopAllStreams]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen && isActive && isConnected) {
      setElapsedTime(0);
      timer = setInterval(() => setElapsedTime((t) => t + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, isActive, isConnected]);

  // Get user camera as soon as dialog opens for preview
  useEffect(() => {
    if (isOpen && !localStream) {
      const getPreviewCamera = async () => {
        try {
          console.log('[VideoCallDialog] Getting local preview camera...');
          const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: true, 
            video: true 
          });
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
    }
  }, [isOpen, localStream, toast]);


  const handleRemoteStream = useCallback((stream: MediaStream) => {
    console.log('[VideoCallDialog] Received remote stream with tracks:', {
      audio: stream.getAudioTracks().length,
      video: stream.getVideoTracks().length
    });
    setRemoteStream(stream);
  }, []);

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
                setLocalStream(stream); // Use the stream from WebRTC service
            } else {
                webrtcServiceRef.current = null;
                initializationAttemptedRef.current = false;
            }
        } catch (error: any) {
             if (!error.message?.includes('aborted')) {
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
      firestore, self?.id, currentCall?.id, currentCall?.status, currentCall?.callerId,
      contact?.id, isReceivingCall, hasAccepted, handleRemoteStream, 
      handleConnectionStateChange, toast, isInitializing
  ]);
  
  const handleAcceptCall = useCallback(async () => {
    if (!currentCall || !isReceivingCall) return;
    setHasAccepted(true);
    await acceptCall();
  }, [currentCall, isReceivingCall, acceptCall]);

  const toggleMic = useCallback(() => {
    const stream = webrtcServiceRef.current?.getLocalStream() || localStream;
    if (stream) {
      const currentlyEnabled = stream.getAudioTracks()[0]?.enabled;
      stream.getAudioTracks().forEach(track => track.enabled = !currentlyEnabled);
      setIsMuted(!!currentlyEnabled);
    }
  }, [localStream]);

  const toggleVideo = useCallback(() => {
    const stream = webrtcServiceRef.current?.getLocalStream() || localStream;
    if (stream) {
      const currentlyEnabled = stream.getVideoTracks()[0]?.enabled;
      stream.getVideoTracks().forEach(track => track.enabled = !currentlyEnabled);
      setIsVideoOff(!!currentlyEnabled);
    }
  }, [localStream]);

  const swapCameras = useCallback(() => setIsSwapped(!isSwapped), [isSwapped]);
  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      await containerRef.current?.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
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
        const timer = setTimeout(() => handleEndCall(), 300);
        return () => clearTimeout(timer);
    }
  }, [shouldClose, handleEndCall]);

  useEffect(() => {
    if (isOpen && currentCall) setLocalCallEnded(false);
  }, [isOpen, currentCall]);

  return (
    <Dialog open={isOpen && !!currentCall && (currentCall.status === 'ringing' || currentCall.status === 'active')} onOpenChange={(open) => !open && handleEndCall()}>
      <DialogContent ref={containerRef} className="max-w-full h-screen w-screen p-0 gap-0 text-white border-0 sm:rounded-none flex flex-col bg-black">
        <DialogHeader className="sr-only">
          <DialogTitle>Video Call with {contact.name}</DialogTitle>
          <DialogDescription>Video call interface</DialogDescription>
        </DialogHeader>

        <div className="relative flex-1 overflow-hidden">
          {/* Main Video Area */}
          <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
             <video
                ref={mainVideoRef}
                autoPlay
                playsInline
                muted={!isSwapped} // Mute if it's the local stream
                className={cn(
                    "w-full h-full object-cover",
                    !isSwapped && isMirrored && "transform scale-x-[-1]"
                )}
             />
             {!isConnected && (
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-4">
                  <h2 className="text-2xl font-bold">{contact.name}</h2>
                   {(isActive || hasAccepted) && !isInitializing ? (
                    <p className="text-gray-300 flex items-center gap-2 justify-center">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Connecting...
                    </p>
                  ) : isReceivingCall && !hasAccepted ? (
                    <p className="text-green-400 text-lg font-semibold animate-pulse">
                      Incoming Video Call...
                    </p>
                  ) : (
                    <p className="text-gray-300 flex items-center gap-2 justify-center">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Calling...
                    </p>
                  )}
                </div>
              )}
          </div>

          {/* Picture-in-Picture Area */}
           {(isConnected || (localStream && !isActive && !hasAccepted)) && (
            <div onClick={isConnected ? swapCameras : undefined} className={cn("absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden shadow-2xl border-2 border-white/30 z-10 transition-all group", isConnected && "cursor-pointer hover:border-purple-400")}>
              <video
                ref={pipVideoRef}
                autoPlay
                playsInline
                muted={isSwapped} // Mute if it's the local stream
                className={cn(
                    "w-full h-full object-cover",
                    isSwapped && isMirrored && "transform scale-x-[-1]"
                )}
              />
              <div className="absolute bottom-1 left-1 text-xs bg-black/60 px-2 py-1 rounded backdrop-blur-sm">
                {isSwapped ? 'You' : contact.name}
              </div>
              {isConnected && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                  <SwitchCamera className="h-8 w-8 text-white drop-shadow-lg" />
                </div>
              )}
            </div>
          )}

          {isActive && isConnected && (
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full z-10">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="font-mono text-sm tabular-nums">{formatTime(elapsedTime)}</span>
            </div>
          )}

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20">
            {isReceivingCall && callStatus === 'ringing' && !hasAccepted ? (
              <>
                <Button onClick={handleEndCall} size="icon" className="rounded-full h-16 w-16 bg-red-600 hover:bg-red-700 shadow-lg transition-transform hover:scale-105" aria-label="Decline call">
                  <Phone className="h-7 w-7 rotate-[135deg]" />
                </Button>
                <Button onClick={handleAcceptCall} size="icon" className="rounded-full h-16 w-16 bg-green-600 hover:bg-green-700 shadow-lg transition-transform hover:scale-105" aria-label="Accept call">
                  <Phone className="h-7 w-7" />
                </Button>
              </>
            ) : (
              <>
                <Button onClick={toggleMic} size="icon" className={cn('rounded-full h-14 w-14 transition-all shadow-lg', isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-white/20 hover:bg-white/30 backdrop-blur-sm')} aria-label={isMuted ? "Unmute" : "Mute"}>
                  {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                </Button>
                <Button onClick={toggleVideo} size="icon" className={cn('rounded-full h-14 w-14 transition-all shadow-lg', isVideoOff ? 'bg-red-600 hover:bg-red-700' : 'bg-white/20 hover:bg-white/30 backdrop-blur-sm')} aria-label={isVideoOff ? "Turn on camera" : "Turn off camera"}>
                  {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
                </Button>
                <Button onClick={handleEndCall} size="icon" className="rounded-full h-16 w-16 bg-red-600 hover:bg-red-700 shadow-lg transition-transform hover:scale-105" aria-label="End call">
                  <Phone className="h-7 w-7 rotate-[135deg]" />
                </Button>
                <Button onClick={() => setIsMirrored(!isMirrored)} size="icon" className="rounded-full h-14 w-14 bg-white/20 hover:bg-white/30 backdrop-blur-sm shadow-lg" aria-label="Mirror video">
                  <FlipHorizontal className="h-6 w-6" />
                </Button>
                <Button onClick={toggleFullscreen} size="icon" className="rounded-full h-14 w-14 bg-white/20 hover:bg-white/30 backdrop-blur-sm shadow-lg" aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}>
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
