
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
import { Mic, MicOff, Phone, ScreenShare, X, ArrowLeft, Volume2, Maximize, Minimize, Expand } from 'lucide-react';
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mainView, setMainView] = useState<'contact' | 'self'>('contact');

  // Draggable state for PiP
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const pipRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef({ x: 0, y: 0 });
  
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSwapViews = () => {
    setMainView(prev => prev === 'contact' ? 'self' : 'contact');
  };

  // --- Drag and Drop Logic ---
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (pipRef.current) {
      setIsDragging(true);
      const rect = pipRef.current.getBoundingClientRect();
      offsetRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && pipRef.current) {
        const parentRect = pipRef.current.parentElement?.getBoundingClientRect();
        if (!parentRect) return;

      let newX = e.clientX - offsetRef.current.x - parentRect.left;
      let newY = e.clientY - offsetRef.current.y - parentRect.top;

      // Constrain within parent bounds
      newX = Math.max(0, Math.min(newX, parentRect.width - pipRef.current.offsetWidth));
      newY = Math.max(0, Math.min(newY, parentRect.height - pipRef.current.offsetHeight));

      setPosition({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  const toggleFullscreen = async () => {
    const container = document.getElementById('video-call-dialog-content');
    if (!container) return;
  
    try {
      if (!document.fullscreenElement) {
        await container.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
      toast({
        variant: 'destructive',
        title: 'Fullscreen Error',
        description: 'Could not enter fullscreen mode.',
      });
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const mainIsSelf = mainView === 'self';
  const pipIsSelf = mainView === 'contact';

  const MainView = () => {
    return (
      <div className="h-full w-full object-cover flex items-center justify-center">
        {mainIsSelf ? (
          isVideoOff ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gray-800">
                <Avatar className="w-40 h-40">
                    <AvatarImage src={selfAvatar?.imageUrl} />
                    <AvatarFallback className="text-4xl">{self?.name.slice(0, 2)}</AvatarFallback>
                </Avatar>
            </div>
          ) : (
            <video ref={selfVideoRef} autoPlay muted className="w-full h-full object-cover scale-x-[-1]" />
          )
        ) : (
           <video ref={contactVideoRef} autoPlay className="w-full h-full object-cover" />
        )}
      </div>
    );
  };

  const PipView = () => {
    return (
      <div 
        ref={pipRef}
        className="absolute w-40 sm:w-48 h-56 sm:h-64 bg-black rounded-lg overflow-hidden border-2 border-white/20 shadow-lg group"
        style={{ top: `${position.y}px`, left: `${position.x}px` }}
      >
        <div className="absolute inset-0 cursor-move" onMouseDown={handleMouseDown} />
        <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gray-800">
          {pipIsSelf ? (
             isVideoOff ? (
                <Avatar className="w-20 h-20">
                    <AvatarImage src={selfAvatar?.imageUrl} />
                    <AvatarFallback className="text-2xl">{self?.name.slice(0, 2)}</AvatarFallback>
                </Avatar>
             ) : (
                <video ref={selfVideoRef} autoPlay muted className="w-full h-full object-cover scale-x-[-1]" />
             )
          ) : (
             <video ref={contactVideoRef} autoPlay muted className="w-full h-full object-cover" />
          )}
        </div>
         <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span>{formatTime(elapsedTime)}</span>
        </div>
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full text-white"
                onClick={handleSwapViews}
            >
                <Expand className="h-5 w-5" />
            </Button>
        </div>
      </div>
    );
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent id="video-call-dialog-content" className="max-w-full h-screen w-screen p-0 gap-0 bg-gray-900 text-white border-0 sm:rounded-none flex flex-col data-[state=open]:sm:zoom-in-100">
        <DialogHeader className="sr-only">
          <DialogTitle>Video Call with {contact.name}</DialogTitle>
          <DialogDescription>A video call interface.</DialogDescription>
        </DialogHeader>
        <div className="flex-1 relative overflow-hidden bg-black flex items-center justify-center">
            
            <MainView />

            <div className="absolute inset-0 bg-black/10" />

            <PipView />
            
             {/* Controls */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex justify-center items-center gap-4">
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
