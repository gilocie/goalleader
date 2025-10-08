
'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Video, VideoOff, Phone, ScreenShare, X, ArrowLeft, Volume2 } from 'lucide-react';
import type { Contact } from '@/types/chat';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useChat } from '@/context/chat-context';

interface VideoCallDialogProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact;
}

export function VideoCallDialog({ isOpen, onClose, contact }: VideoCallDialogProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const selfVideoRef = useRef<HTMLVideoElement>(null);
  const contactVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const { toast } = useToast();
  const { self } = useChat();

  const selfAvatar = self ? PlaceHolderImages.find((img) => img.id === self.id) : undefined;
  const contactAvatar = PlaceHolderImages.find((img) => img.id === contact.id);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen) {
        setElapsedTime(0);
        timer = setInterval(() => {
            setElapsedTime(prev => prev + 1);
        }, 1000);
    }
    return () => {
        if(timer) clearInterval(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      return;
    }

    const getMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        setHasPermission(true);
        
        // Both refs will use the same stream for this simulation
        if (selfVideoRef.current) selfVideoRef.current.srcObject = stream;
        if (contactVideoRef.current) contactVideoRef.current.srcObject = stream;

      } catch (err) {
        console.error("Failed to get media", err);
        setHasPermission(false);
        toast({
          variant: "destructive",
          title: "Media Access Denied",
          description: "Please allow camera and microphone access.",
        });
        onClose();
      }
    };
    getMedia();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  }, [isOpen, onClose, toast]);

  const toggleMic = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
        setIsMuted(!track.enabled);
      });
    }
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
        setIsVideoOff(!track.enabled);
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-full h-screen w-screen p-0 gap-0 bg-gray-900 text-white border-0 sm:rounded-lg sm:max-w-4xl sm:h-[80vh] flex flex-col">
        <DialogHeader className="sr-only">
          <DialogTitle>Video Call with {contact.name}</DialogTitle>
          <DialogDescription>A video call interface.</DialogDescription>
        </DialogHeader>
        <div className="flex-1 relative overflow-hidden bg-black flex items-center justify-center">
            {/* Contact Video (Main) */}
            <video ref={contactVideoRef} autoPlay className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/10" />

            {/* Header controls */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
                <Button onClick={onClose} variant="ghost" size="icon" className="text-white bg-black/30 hover:bg-black/50 rounded-full">
                    <ArrowLeft />
                </Button>
                <div className="flex items-center gap-2 bg-black/30 text-white text-sm font-medium px-3 py-1.5 rounded-full">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></div>
                    <span>{formatTime(elapsedTime)}</span>
                </div>
            </div>

            {/* Self Video (Picture-in-picture) */}
            <div className="absolute bottom-24 sm:bottom-28 right-4 w-32 h-48 sm:w-40 sm:h-56 bg-black rounded-lg overflow-hidden border-2 border-white/20 shadow-lg">
                {isVideoOff ? (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gray-800">
                        <Avatar className="w-16 h-16">
                            <AvatarImage src={selfAvatar?.imageUrl} />
                            <AvatarFallback className="text-xl">
                                {self?.name.slice(0, 2)}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                ) : (
                    <video ref={selfVideoRef} autoPlay muted className="w-full h-full object-cover scale-x-[-1]" />
                )}
            </div>
             {/* Controls */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex justify-center items-center gap-4">
                <Button onClick={toggleMic} variant="secondary" size="icon" className={cn("rounded-full h-14 w-14", isMuted && 'bg-destructive text-destructive-foreground')}>
                    {isMuted ? <MicOff /> : <Mic />}
                </Button>
                <Button onClick={toggleVideo} variant="secondary" size="icon" className={cn("rounded-full h-14 w-14", isVideoOff && 'bg-destructive text-destructive-foreground')}>
                    {isVideoOff ? <VideoOff /> : <Video />}
                </Button>
                 <Button variant="secondary" size="icon" className="rounded-full h-14 w-14">
                    <Volume2 />
                </Button>
                <Button onClick={onClose} variant="destructive" size="icon" className="rounded-full h-14 w-14">
                    <Phone className="transform -scale-x-100" />
                </Button>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
