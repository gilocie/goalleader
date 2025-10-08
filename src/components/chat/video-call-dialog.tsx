
'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Video, VideoOff, Phone, ScreenShare, X } from 'lucide-react';
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
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  
  const selfVideoRef = useRef<HTMLVideoElement>(null);
  const contactVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  const { toast } = useToast();
  const { self } = useChat();

  const selfAvatar = self ? PlaceHolderImages.find((img) => img.id === self.id) : undefined;
  const contactAvatar = PlaceHolderImages.find((img) => img.id === contact.id);

  useEffect(() => {
    if (!isOpen) {
      // Stop all tracks when dialog closes
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
      }
      return;
    }

    const getMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        setHasPermission(true);
        if (selfVideoRef.current) {
          selfVideoRef.current.srcObject = stream;
        }
        // In a real app, you'd use a WebRTC connection to get the contact's stream
        if (contactVideoRef.current) {
          contactVideoRef.current.srcObject = stream; // Simulate contact video with self video for now
        }
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
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
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
  
  const toggleScreenShare = async () => {
    if (isScreenSharing) {
        // Stop screen sharing - logic to switch back to camera
        if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach(track => track.stop());
            screenStreamRef.current = null;
        }
        if (selfVideoRef.current && streamRef.current) {
            selfVideoRef.current.srcObject = streamRef.current;
        }
        setIsScreenSharing(false);
    } else {
        // Start screen sharing
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            screenStreamRef.current = screenStream;
            if (selfVideoRef.current) {
                selfVideoRef.current.srcObject = screenStream;
            }
            setIsScreenSharing(true);
            screenStream.getVideoTracks()[0].onended = () => {
                toggleScreenShare(); // Revert back to camera when user stops sharing from browser UI
            };
        } catch (err) {
            console.error("Screen share failed", err);
            toast({ variant: 'destructive', title: 'Could not share screen.' });
        }
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 gap-0 bg-gray-900 text-white border-0">
        <div className="flex-1 grid grid-cols-2 relative overflow-hidden">
            {/* Contact Video */}
            <div className="relative bg-gray-800 flex items-center justify-center">
                 <video ref={contactVideoRef} autoPlay className="w-full h-full object-cover scale-x-[-1]" />
                 <div className="absolute bottom-4 left-4 text-sm bg-black/50 px-2 py-1 rounded-md">{contact.name}</div>
            </div>
            
            {/* Self Video */}
            <div className="relative bg-gray-800 flex items-center justify-center border-l-2 border-gray-700">
                {isVideoOff ? (
                    <div className="flex flex-col items-center gap-2">
                        <Avatar className="w-24 h-24">
                            <AvatarImage src={selfAvatar?.imageUrl} />
                            <AvatarFallback className="text-3xl">
                                {self?.name.slice(0, 2)}
                            </AvatarFallback>
                        </Avatar>
                        <p className="text-muted-foreground">Camera is off</p>
                    </div>
                ) : (
                    <video ref={selfVideoRef} autoPlay muted className="w-full h-full object-cover scale-x-[-1]" />
                )}
                 <div className="absolute bottom-4 left-4 text-sm bg-black/50 px-2 py-1 rounded-md">You</div>
            </div>
        </div>

        {/* Controls */}
        <div className="bg-gray-800/80 backdrop-blur-sm p-4 flex justify-center items-center gap-4">
             <Button onClick={toggleMic} variant={isMuted ? "destructive" : "secondary"} size="icon" className="rounded-full h-12 w-12">
                {isMuted ? <MicOff /> : <Mic />}
            </Button>
             <Button onClick={toggleVideo} variant={isVideoOff ? "destructive" : "secondary"} size="icon" className="rounded-full h-12 w-12">
                {isVideoOff ? <VideoOff /> : <Video />}
            </Button>
            <Button onClick={toggleScreenShare} variant={isScreenSharing ? "default" : "secondary"} size="icon" className="rounded-full h-12 w-12">
                <ScreenShare />
            </Button>
            <Button onClick={onClose} variant="destructive" size="icon" className="rounded-full h-14 w-14 mx-4">
                <Phone className="transform -scale-x-100" />
            </Button>
        </div>
         <Button onClick={onClose} variant="ghost" size="icon" className="absolute top-4 right-4 text-white hover:bg-white/10 rounded-full">
            <X />
        </Button>
      </DialogContent>
    </Dialog>
  );
}
