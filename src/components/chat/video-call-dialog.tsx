
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
} from 'lucide-react';
import type { Contact } from '@/types/chat';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useChat } from '@/context/chat-context';

type CallStatus = 'connecting' | 'ringing' | 'connected';

interface VideoCallDialogProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact;
}

export function VideoCallDialog({ isOpen, onClose, contact }: VideoCallDialogProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [callStatus, setCallStatus] = useState<CallStatus>('connecting');
  const [isStreamReady, setIsStreamReady] = useState(false);

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
          audio: true,
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
          description: 'Please allow camera and microphone access.',
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  const toggleFullscreen = async () => {
    const container = document.getElementById('video-call-dialog-content');
    if (!container) return;
    try {
      if (!document.fullscreenElement) {
        await container.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Fullscreen Error',
        description: 'Could not enter fullscreen mode.',
      });
    }
  };

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        id="video-call-dialog-content"
        className="max-w-full h-screen w-screen p-0 gap-0 bg-gray-900 text-white border-0 sm:rounded-none flex flex-col data-[state=open]:sm:zoom-in-100"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Video Call with {contact.name}</DialogTitle>
          <DialogDescription>Video call interface</DialogDescription>
        </DialogHeader>

        <div id="video-call-container" className="flex-1 relative flex items-center justify-center">
            {/* Main view container */}
            <div className="relative w-[80vw] max-w-4xl aspect-video bg-black rounded-lg shadow-2xl">
                {/* Contact's View */}
                <div className="w-full h-full flex flex-col items-center justify-center">
                    {callStatus !== 'connected' ? (
                        <div className="text-center space-y-2">
                             <Avatar className="w-40 h-40">
                                <AvatarImage
                                src={contactAvatar?.imageUrl}
                                data-ai-hint={contactAvatar?.imageHint}
                                />
                                <AvatarFallback className="text-5xl">{contact.name.slice(0, 2)}</AvatarFallback>
                            </Avatar>
                            <p className="font-semibold text-2xl mt-4">{contact.name}</p>
                            <p className="text-lg text-white/70 capitalize">{callStatus}...</p>
                        </div>
                    ) : (
                         <Avatar className="w-40 h-40">
                            <AvatarImage
                            src={contactAvatar?.imageUrl}
                            data-ai-hint={contactAvatar?.imageHint}
                            />
                            <AvatarFallback className="text-5xl">{contact.name.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                    )}
                </div>

                {/* Self View (PiP) */}
                <div className="absolute top-4 left-4 w-48 h-36 rounded-lg overflow-hidden border-2 border-white/20 shadow-lg bg-gray-800">
                    {isStreamReady ? (
                        <video
                            ref={selfVideoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                            style={{ transform: 'scaleX(-1)' }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                             <Avatar className="w-16 h-16">
                                <AvatarImage src={selfAvatar?.imageUrl} />
                                <AvatarFallback>{self?.name.slice(0,2)}</AvatarFallback>
                            </Avatar>
                        </div>
                    )}
                     <div className="absolute bottom-1 left-1 text-white text-xs bg-black/50 px-1.5 py-0.5 rounded">
                        You
                    </div>
                </div>

                {/* Timer */}
                 {callStatus === 'connected' && (
                    <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full z-30">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                        <span>{formatTime(elapsedTime)}</span>
                    </div>
                )}
            </div>

            {/* Controls */}
             <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex justify-center items-center gap-4 z-30">
              <Button onClick={toggleMic} variant="secondary" size="icon" className={cn("rounded-full h-14 w-14 bg-white/20 text-white hover:bg-white/30", isMuted && 'bg-destructive text-destructive-foreground')}>
                {isMuted ? <MicOff /> : <Mic />}
              </Button>
              <Button variant="secondary" size="icon" className="rounded-full h-14 w-14 bg-white/20 text-white hover:bg-white/30">
                <Volume2 />
              </Button>
              <Button onClick={onClose} variant="destructive" size="icon" className="rounded-full h-14 w-14">
                <Phone className="transform -scale-x-100" />
              </Button>
              <Button onClick={toggleFullscreen} variant="secondary" size="icon" className="rounded-full h-14 w-14 bg-white/20 text-white hover:bg-white/30">
                {isFullscreen ? <Minimize /> : <Maximize />}
              </Button>
            </div>

             {/* Dark overlay for pre-connected states */}
             {callStatus !== 'connected' && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-[-1]"></div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
