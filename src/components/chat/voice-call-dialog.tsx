
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
import { Mic, MicOff, Phone, Volume2, VolumeX, Loader2 } from 'lucide-react';
import type { Contact } from '@/types/chat';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface VoiceCallDialogProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact;
}

export function VoiceCallDialog({ isOpen, onClose, contact }: VoiceCallDialogProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [callStatus, setCallStatus] = useState<'calling' | 'ringing' | 'connected'>('calling');

  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  const contactAvatar = PlaceHolderImages.find((img) => img.id === contact.id);

  // Call Status Simulation
  useEffect(() => {
    if (isOpen) {
      setCallStatus('calling');
      const t1 = setTimeout(() => setCallStatus('ringing'), 2000);
      const t2 = setTimeout(() => setCallStatus('connected'), 5000);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [isOpen]);

  // Elapsed time
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen && callStatus === 'connected') {
      setElapsedTime(0);
      timer = setInterval(() => setElapsedTime((t) => t + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, callStatus]);

  // Mic setup
  useEffect(() => {
    if (!isOpen) {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      return;
    }

    const getMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
      } catch {
        toast({
          variant: 'destructive',
          title: 'Mic Access Denied',
          description: 'Please allow microphone access.',
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
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gray-800 text-white border-0 shadow-2xl p-8">
        <DialogHeader className="sr-only">
          <DialogTitle>Voice Call with {contact.name}</DialogTitle>
          <DialogDescription>Voice call interface</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center space-y-6">
          <Avatar className="h-40 w-40 border-4 border-gray-600">
            <AvatarImage src={contactAvatar?.imageUrl} data-ai-hint={contactAvatar?.imageHint} />
            <AvatarFallback className="text-5xl bg-gray-700">{contact.name.slice(0, 2)}</AvatarFallback>
          </Avatar>

          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold">{contact.name}</h2>
            {callStatus === 'connected' ? (
              <p className="text-lg text-gray-300 font-mono">{formatTime(elapsedTime)}</p>
            ) : (
              <p className="text-lg text-gray-300 capitalize flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                {callStatus}...
              </p>
            )}
          </div>

          <div className="flex items-center space-x-6 pt-8">
            <Button
              onClick={toggleMic}
              variant="secondary"
              size="icon"
              className={cn(
                'rounded-full h-16 w-16 bg-white/10 text-white hover:bg-white/20',
                isMuted && 'bg-destructive text-destructive-foreground'
              )}
            >
              {isMuted ? <MicOff className="h-7 w-7" /> : <Mic className="h-7 w-7" />}
            </Button>
            <Button
              onClick={onClose}
              variant="destructive"
              size="icon"
              className="rounded-full h-16 w-16"
            >
              <Phone className="h-7 w-7 transform -scale-x-100" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full h-16 w-16 bg-white/10 text-white hover:bg-white/20"
            >
              <Volume2 className="h-7 w-7" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
