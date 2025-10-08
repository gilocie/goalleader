
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Mic,
  MicOff,
  Phone,
  Volume2,
  Maximize,
  Minimize,
  Expand,
  ZoomIn,
  ZoomOut,
  Loader2,
} from 'lucide-react';
import type { Contact } from '@/types/chat';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useChat } from '@/context/chat-context';

// ---------- Types ----------
interface DraggableState {
  position: { x: number; y: number };
  size: { width: number; height: number };
  isDragging: boolean;
}

type CallStatus = 'connecting' | 'ringing' | 'connected';

// ---------- Main Dialog ----------
interface VideoCallDialogProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact;
}

export function VideoCallDialog({ isOpen, onClose, contact }: VideoCallDialogProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isStreamReady, setIsStreamReady] = useState(false);
  const [callStatus, setCallStatus] = useState<CallStatus>('connecting');

  const selfVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const { toast } = useToast();
  const { self } = useChat();

  const selfAvatar = self
    ? PlaceHolderImages.find((img) => img.id === self.id)
    : undefined;
  const contactAvatar = PlaceHolderImages.find((img) => img.id === contact.id);

  // ---- Call State Simulation ----
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (isOpen) {
      setCallStatus('connecting');
      setElapsedTime(0);

      const connectingTimer = setTimeout(() => {
        setCallStatus('ringing');
        const ringingTimer = setTimeout(() => {
          setCallStatus('connected');
          timer = setInterval(() => setElapsedTime((t) => t + 1), 1000);
        }, 3000); // Ring for 3 seconds
        return () => clearTimeout(ringingTimer);
      }, 2000); // Connect for 2 seconds

      return () => {
        clearTimeout(connectingTimer);
        if (timer) clearInterval(timer);
      };
    }
  }, [isOpen]);

  // ---- Camera and mic setup ----
  useEffect(() => {
    if (!isOpen) {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setIsStreamReady(false);
      return;
    }

    const getMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        streamRef.current = stream;

        const assignStream = () => {
          if (selfVideoRef.current) {
            selfVideoRef.current.srcObject = stream;
            setIsStreamReady(true);
          } else {
            setTimeout(assignStream, 200);
          }
        };
        assignStream();
      } catch {
        toast({
          variant: 'destructive',
          title: 'Media Access Denied',
          description: 'Please allow camera and microphone access.'
        });
        onClose();
      }
    };

    getMedia();

    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [isOpen, onClose, toast]);

  const toggleMic = () => {
    streamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
      setIsMuted(!track.enabled);
    });
  };

  // ---- Fullscreen ----
  const toggleFullscreen = async () => {
    const container = document.getElementById('video-call-dialog-content');
    if (!container) return;
    try {
      if (!document.fullscreenElement) await container.requestFullscreen();
      else await document.exitFullscreen();
    } catch {
      toast({
        variant: 'destructive',
        title: 'Fullscreen Error',
        description: 'Could not enter fullscreen mode.'
      });
    }
  };

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  const getStatusText = () => {
    if (callStatus === 'connected') {
      return formatTime(elapsedTime);
    }
    return callStatus.charAt(0).toUpperCase() + callStatus.slice(1) + '...';
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          id="video-call-dialog-content"
          className="max-w-3xl h-[600px] p-0 gap-0 text-white border-0 sm:rounded-lg flex flex-col bg-gray-800 shadow-2xl"
        >
          <DialogHeader className="sr-only">
            <DialogTitle>Video Call with {contact.name}</DialogTitle>
            <DialogDescription>Video call interface</DialogDescription>
          </DialogHeader>

          <div
            id="video-call-container"
            className="flex-1 relative overflow-hidden"
          >
            {/* Main Video Area (Contact) */}
            <div className="w-full h-full flex items-center justify-center bg-gray-900">
                {callStatus !== 'connected' ? (
                     <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-8 h-8 animate-spin" />
                        <p className="text-xl font-semibold">{getStatusText()}</p>
                    </div>
                ) : (
                    <Avatar className="w-40 h-40">
                        <AvatarImage src={contactAvatar?.imageUrl} data-ai-hint={contactAvatar?.imageHint} />
                        <AvatarFallback className="text-5xl">{contact.name.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                )}
            </div>

            {/* Self Video (Circular) */}
            <div className="absolute bottom-6 left-6 w-32 h-32 rounded-full overflow-hidden border-4 border-white/20 shadow-lg">
                <video
                    ref={selfVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                    style={{ transform: 'scaleX(-1)' }}
                />
            </div>

            <div className="absolute bottom-1 left-12 text-center">
                 <p className="text-sm font-semibold [text-shadow:0_1px_2px_var(--tw-shadow-color)] shadow-black/50">{self?.name}</p>
            </div>
            
            {/* Contact Info (Top) */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-center">
                <Avatar className="w-16 h-16">
                    <AvatarImage src={contactAvatar?.imageUrl} data-ai-hint={contactAvatar?.imageHint} />
                    <AvatarFallback>{contact.name.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <p className="font-semibold text-lg [text-shadow:0_1px_2px_var(--tw-shadow-color)] shadow-black/50">{contact.name}</p>
            </div>

            {/* Timer */}
            {callStatus === 'connected' && (
                <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full z-30">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                    <span>{formatTime(elapsedTime)}</span>
                </div>
            )}

             {/* Controls */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex justify-center items-center gap-4 z-30">
              <Button onClick={toggleMic} variant="secondary" size="icon" className={cn("rounded-full h-12 w-12 bg-white/10 text-white hover:bg-white/20", isMuted && 'bg-destructive text-destructive-foreground')}>
                {isMuted ? <MicOff className="h-5 w-5"/> : <Mic className="h-5 w-5"/>}
              </Button>
              <Button onClick={onClose} variant="destructive" size="icon" className="rounded-full h-14 w-14">
                <Phone className="transform -scale-x-100 h-6 w-6" />
              </Button>
              <Button onClick={toggleFullscreen} variant="secondary" size="icon" className="rounded-full h-12 w-12 bg-white/10 text-white hover:bg-white/20">
                {isFullscreen ? <Minimize className="h-5 w-5"/> : <Maximize className="h-5 w-5"/>}
              </Button>
            </div>

          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
