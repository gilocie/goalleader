
'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Phone, Video, VideoOff } from 'lucide-react';
import type { Contact } from '@/types/chat';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface CallingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact;
}

export function CallingDialog({ isOpen, onClose, contact }: CallingDialogProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(true);
  const [callStatus, setCallStatus] = useState('Ringing...');

  const avatar = PlaceHolderImages.find((img) => img.id === contact.id);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setCallStatus('Connecting...');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gray-800 text-white border-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Outgoing Call</DialogTitle>
          <DialogDescription>
            Calling {contact.name}. You can mute, turn on video, or hang up.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-8 space-y-6">
          <div className="relative">
            <Avatar className="h-32 w-32 border-4 border-gray-600">
              <AvatarImage src={avatar?.imageUrl} alt={contact.name} />
              <AvatarFallback className="text-4xl bg-gray-700">
                {contact.name.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-2 -right-2 bg-gray-800 rounded-full p-1">
                 <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                    <Phone className="h-4 w-4 text-white" />
                </div>
            </div>
          </div>

          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold">{contact.name}</h2>
            <p className="text-gray-400">{callStatus}</p>
          </div>

          <div className="flex items-center space-x-4 pt-4">
            <Button
              variant={isMuted ? 'destructive' : 'secondary'}
              size="icon"
              className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20"
              onClick={() => setIsMuted((prev) => !prev)}
            >
              {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
            </Button>
            <Button
              variant={isVideoOff ? 'destructive' : 'secondary'}
              size="icon"
              className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20"
              onClick={() => setIsVideoOff((prev) => !prev)}
            >
              {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
            </Button>
            <Button
              variant="destructive"
              size="icon"
              className="w-14 h-14 rounded-full"
              onClick={onClose}
            >
              <Phone className="h-6 w-6 transform -scale-x-100" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
