

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Phone, Video, VideoOff, Maximize, Minimize, Loader2 } from 'lucide-react';
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

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const webrtcServiceRef = useRef<WebRTCService | null>(null);
  
  const { toast } = useToast();
  const firestore = useFirestore();
  const { currentCall, endCall, acceptCall, declineCall, self } = useChat();

  const contactAvatar = PlaceHolderImages.find((img) => img.id === contact.id);
  const selfAvatar = self ? PlaceHolderImages.find((img) => img.id === self.id) : undefined;
  
  const callStatus = currentCall?.status || 'ringing';
  const isActive = callStatus === 'active';
  const isConnected = connectionState === 'connected';

  // Handle ending call
  const handleEndCall = useCallback(() => {
    webrtcServiceRef.current?.cleanup();
    
    if (currentCall) {
      endCall(contact.id);
    }
    
    onClose();
  }, [currentCall, contact.id, endCall, onClose]);

  // Format elapsed time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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

        // Initialize with audio and video
        const localStream = await webrtcServiceRef.current.initialize(
          // On remote stream
          (remoteStream) => {
            console.log('Remote stream received with tracks:', remoteStream.getTracks().length);
            if (remoteVideoRef.current && remoteStream.getTracks().length > 0) {
              remoteVideoRef.current.srcObject = remoteStream;
              // Don't call play() immediately, let it autoplay
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
          // Media constraints (audio and video)
          { audio: true, video: true }
        );

        // Set local video
        if (localVideoRef.current && localStream) {
          localVideoRef.current.srcObject = localStream;
          // Don't call play() - let autoplay handle it
        }

        console.log('WebRTC initialized successfully');
      } catch (error) {
        console.error('Failed to initialize WebRTC:', error);
        toast({
          variant: 'destructive',
          title: 'Call Failed',
          description: 'Could not establish video connection.',
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
      await acceptCall();
    } catch (error) {
      console.error('Failed to accept call:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to accept call.',
      });
    }
  }, [currentCall, isReceivingCall, acceptCall, toast]);

  // Handle declining incoming call
  const handleDeclineCall = useCallback(async () => {
    if (!currentCall || !isReceivingCall) return;
    
    try {
      await declineCall();
      onClose();
    } catch (error) {
      console.error('Failed to decline call:', error);
    }
  }, [currentCall, isReceivingCall, declineCall, onClose]);

  // Toggle microphone
  const toggleMic = useCallback(() => {
    if (webrtcServiceRef.current) {
      const newMutedState = !isMuted;
      webrtcServiceRef.current.toggleAudio(!newMutedState);
      setIsMuted(newMutedState);
    }
  }, [isMuted]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (webrtcServiceRef.current) {
      const newVideoOffState = !isVideoOff;
      webrtcServiceRef.current.toggleVideo(!newVideoOffState);
      setIsVideoOff(newVideoOffState);
    }
  }, [isVideoOff]);

  // Toggle fullscreen
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

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

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

  return (
    <Dialog open={isOpen} onOpenChange={handleEndCall}>
      <DialogContent 
        ref={containerRef}
        className="max-w-full h-screen w-screen p-0 gap-0 text-white border-0 sm:rounded-none flex flex-col bg-black"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Video Call with {contact.name}</DialogTitle>
          <DialogDescription>Video call interface</DialogDescription>
        </DialogHeader>

        <div className="relative flex-1 overflow-hidden">
          {/* Remote Video (Main view) */}
          <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
            {isConnected && remoteVideoRef.current?.srcObject ? (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                muted={false} 
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center gap-4">
                <Avatar className="h-40 w-40 border-4 border-purple-500/30">
                  <AvatarImage src={contactAvatar?.imageUrl} data-ai-hint={contactAvatar?.imageHint} />
                  <AvatarFallback className="text-5xl bg-gradient-to-br from-purple-600 to-blue-600">
                    {contact.name.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">{contact.name}</h2>
                  {isActive && !isConnected && (
                    <p className="text-gray-400 flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Connecting...
                    </p>
                  )}
                  {isReceivingCall && callStatus === 'ringing' && (
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

          {/* Local Video (PiP) */}
          <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden shadow-2xl border-2 border-white/20 z-10">
            {isVideoOff ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-700">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={selfAvatar?.imageUrl} data-ai-hint={selfAvatar?.imageHint} />
                  <AvatarFallback className="text-2xl">
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
                className="w-full h-full object-cover transform scale-x-[-1]"
              />
            )}
            <div className="absolute bottom-1 left-1 text-xs bg-black/50 px-2 py-0.5 rounded">
              You
            </div>
          </div>

          {/* Call timer */}
          {isActive && isConnected && (
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 backdrop-blur-sm text-white px-3 py-1.5 rounded-full z-10">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="font-mono text-sm tabular-nums">{formatTime(elapsedTime)}</span>
            </div>
          )}

          {/* Call Controls */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20">
            {isReceivingCall && callStatus === 'ringing' ? (
              <>
                <Button
                  onClick={handleDeclineCall}
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
                  disabled={!isActive}
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
                  disabled={!isActive}
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
