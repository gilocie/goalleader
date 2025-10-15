
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Phone, PhoneOff } from 'lucide-react';
import type { Contact } from '@/types/chat';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useChat } from '@/context/chat-context';
import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface IncomingCallDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDecline: () => void;
  onAccept: () => void;
  contact: Contact | null;
}

export function IncomingCallDialog({ isOpen, onClose, onDecline, onAccept, contact }: IncomingCallDialogProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => {
          console.error("could not get camera stream for background", err);
        });
      
      // Play ringtone when dialog opens
      audioRef.current = new Audio('/sounds/incoming-tones/default.mp3');
      audioRef.current.loop = true;
      audioRef.current.play().catch(e => console.warn("Autoplay blocked for ringtone", e));

    } else {
        if (videoRef.current && videoRef.current.srcObject) {
            (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  }, [isOpen]);

  if (!contact) return null;

  const avatar = PlaceHolderImages.find((img) => img.id === contact.id);
  
  const handleAccept = () => {
    if(audioRef.current) audioRef.current.pause();
    onAccept();
  };

  const handleDecline = () => {
    if(audioRef.current) audioRef.current.pause();
    onDecline();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-transparent text-white border-0 shadow-none p-0 overflow-hidden">
        <video ref={videoRef} autoPlay muted playsInline className="absolute top-0 left-0 w-full h-full object-cover blur-md scale-110" />
        <div className="absolute inset-0 bg-black/50" />
        
        <div className="relative flex flex-col items-center justify-center p-8 space-y-6 h-full">
            <DialogHeader className="sr-only">
            <DialogTitle>Incoming Call</DialogTitle>
            <DialogDescription>
                Incoming video call from {contact.name}. You can accept or decline.
            </DialogDescription>
            </DialogHeader>
            <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-gray-600 animate-pulse">
                <AvatarImage src={avatar?.imageUrl} alt={contact.name} />
                <AvatarFallback className="text-4xl bg-gray-700">
                    {contact.name.slice(0, 2)}
                </AvatarFallback>
                </Avatar>
            </div>

            <div className="text-center space-y-1">
                <h2 className="text-2xl font-bold">{contact.name}</h2>
                <p className="text-gray-300">Incoming Video Call...</p>
            </div>

            <div className="flex items-center space-x-6 pt-4">
                <div className="flex flex-col items-center gap-2">
                    <Button
                    variant="destructive"
                    size="icon"
                    className="w-14 h-14 rounded-full animate-pulse-strong"
                    onClick={handleDecline}
                    >
                    <PhoneOff className="h-6 w-6" />
                    </Button>
                    <span className="text-sm">Decline</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <Button
                    size="icon"
                    className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 animate-pulse-strong"
                    onClick={handleAccept}
                    >
                    <Phone className="h-6 w-6" />
                    </Button>
                    <span className="text-sm">Accept</span>
                </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
