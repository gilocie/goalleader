

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

interface IncomingCallDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDecline: () => void;
  onAccept: () => void;
  contact: Contact | null;
}

export function IncomingCallDialog({ isOpen, onClose, onDecline, onAccept, contact }: IncomingCallDialogProps) {

  if (!contact) return null;

  const avatar = PlaceHolderImages.find((img) => img.id === contact.id);
  
  const handleAccept = () => {
    onAccept();
  };

  const handleDecline = () => {
    onDecline();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gray-800 text-white border-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Incoming Call</DialogTitle>
          <DialogDescription>
            Incoming call from {contact.name}. You can accept or decline.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-8 space-y-6">
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
            <p className="text-gray-400">Incoming Call...</p>
          </div>

          <div className="flex items-center space-x-6 pt-4">
             <div className="flex flex-col items-center gap-2">
                <Button
                variant="destructive"
                size="icon"
                className="w-14 h-14 rounded-full"
                onClick={handleDecline}
                >
                <PhoneOff className="h-6 w-6" />
                </Button>
                <span className="text-sm">Decline</span>
            </div>
             <div className="flex flex-col items-center gap-2">
                <Button
                size="icon"
                className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-600"
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
