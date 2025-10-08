
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
import { Mic, MicOff, Phone, Volume2, Maximize, Minimize, Expand, ZoomIn, ZoomOut } from 'lucide-react';
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

interface DraggableState {
  position: { x: number; y: number };
  size: { width: number; height: number };
  isDragging: boolean;
}

export function VideoCallDialog({ isOpen, onClose, contact }: VideoCallDialogProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mainView, setMainView] = useState<'contact' | 'self'>('contact');

  const [selfFrame, setSelfFrame] = useState<DraggableState>({
    position: { x: 20, y: 20 },
    size: { width: 192, height: 144 }, // 4:3 aspect ratio
    isDragging: false,
  });

  const [contactFrame, setContactFrame] = useState<DraggableState>({
    position: { x: 250, y: 100 },
    size: { width: 640, height: 480 },
    isDragging: false,
  });

  const videoContainerRef = useRef<HTMLDivElement>(null);
  const selfVideoRef = useRef<HTMLVideoElement>(null);
  const contactVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  const { toast } = useToast();
  const { self } = useChat();

  const selfAvatar = self ? PlaceHolderImages.find((img) => img.id === self.id) : undefined;
  const contactAvatar = PlaceHolderImages.find((img) => img.id === contact.id);

  // Timer Effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen) {
      setElapsedTime(0);
      timer = setInterval(() => setElapsedTime(prev => prev + 1), 1000);
    }
    return () => { if (timer) clearInterval(timer); };
  }, [isOpen]);

  // Media Stream Effect
  useEffect(() => {
    if (!isOpen) {
      streamRef.current?.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      return;
    }

    const getMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        if (selfVideoRef.current) selfVideoRef.current.srcObject = stream;
        if (contactVideoRef.current) contactVideoRef.current.srcObject = stream; // Mock: using self stream for contact
      } catch (err) {
        toast({ variant: "destructive", title: "Media Access Denied", description: "Please allow camera and microphone access." });
        onClose();
      }
    };
    getMedia();

    return () => {
      streamRef.current?.getTracks().forEach(track => track.stop());
    };
  }, [isOpen, onClose, toast]);

  const toggleMic = () => {
    streamRef.current?.getAudioTracks().forEach(track => {
      track.enabled = !track.enabled;
      setIsMuted(!track.enabled);
    });
  };
  
  const toggleVideo = () => {
    streamRef.current?.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
    });
    setIsVideoOff(prev => !prev);
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSwapViews = () => {
    setMainView(prev => prev === 'self' ? 'contact' : 'self');
  };

  const handleDragStart = (e: React.MouseEvent<HTMLDivElement>, target: 'self' | 'contact') => {
    e.preventDefault();
    const frameState = target === 'self' ? selfFrame : contactFrame;
    const setFrameState = target === 'self' ? setSelfFrame : setContactFrame;
    
    setFrameState(prev => ({ ...prev, isDragging: true }));
    dragOffsetRef.current = {
      x: e.clientX - frameState.position.x,
      y: e.clientY - frameState.position.y,
    };
  };

  const handleDrag = useCallback((e: MouseEvent) => {
    if (!selfFrame.isDragging && !contactFrame.isDragging) return;

    const containerRect = videoContainerRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    const targetFrame = selfFrame.isDragging ? selfFrame : contactFrame;
    const setTargetFrame = selfFrame.isDragging ? setSelfFrame : setContactFrame;
    
    let newX = e.clientX - dragOffsetRef.current.x;
    let newY = e.clientY - dragOffsetRef.current.y;

    newX = Math.max(0, Math.min(newX, containerRect.width - targetFrame.size.width));
    newY = Math.max(0, Math.min(newY, containerRect.height - targetFrame.size.height));

    setTargetFrame(prev => ({...prev, position: {x: newX, y: newY}}));
  }, [selfFrame, contactFrame]);

  const handleDragEnd = useCallback(() => {
    setSelfFrame(prev => ({ ...prev, isDragging: false }));
    setContactFrame(prev => ({ ...prev, isDragging: false }));
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleDrag);
    window.addEventListener('mouseup', handleDragEnd);
    return () => {
      window.removeEventListener('mousemove', handleDrag);
      window.removeEventListener('mouseup', handleDragEnd);
    };
  }, [handleDrag, handleDragEnd]);


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
      toast({ variant: 'destructive', title: 'Fullscreen Error', description: 'Could not enter fullscreen mode.' });
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const DraggableFrame = ({
      frameState,
      setFrameState,
      videoRef,
      avatar,
      name,
      isSelf,
      isMain,
      onDragStart,
      onSwap,
      onZoom,
    }: {
      frameState: DraggableState;
      setFrameState: React.Dispatch<React.SetStateAction<DraggableState>>;
      videoRef: React.RefObject<HTMLVideoElement>;
      avatar?: { imageUrl?: string, imageHint?: string};
      name: string;
      isSelf: boolean;
      isMain: boolean;
      onDragStart: (e: React.MouseEvent<HTMLDivElement>) => void;
      onSwap?: () => void;
      onZoom?: (direction: 'in' | 'out') => void;
    }) => {
      const showVideo = !isSelf || (isSelf && !isVideoOff);
      
      return (
        <div
            className="absolute bg-black rounded-lg overflow-hidden border-2 border-white/20 shadow-2xl group"
            style={{ 
                top: `${frameState.position.y}px`, 
                left: `${frameState.position.x}px`,
                width: `${frameState.size.width}px`,
                height: `${frameState.size.height}px`
            }}
        >
            <div className="absolute top-0 left-0 right-0 h-8 cursor-move bg-black/50 z-20" onMouseDown={onDragStart} />

            <div className="w-full h-full flex items-center justify-center bg-gray-800">
                {showVideo ? (
                    <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" style={{ transform: isSelf ? 'scaleX(-1)' : 'none' }} />
                ) : (
                    <Avatar className={cn(isMain ? 'w-32 h-32' : 'w-20 h-20')}>
                        <AvatarImage src={avatar?.imageUrl} data-ai-hint={avatar?.imageHint} />
                        <AvatarFallback className="text-4xl">{name.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                )}
            </div>

             <div className="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-30 flex gap-2">
                {onSwap && (
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-black/50 text-white" onClick={onSwap}>
                    <Expand className="h-4 w-4" />
                  </Button>
                )}
                 {onZoom && (
                    <>
                        <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-black/50 text-white" onClick={() => onZoom('out')}><ZoomOut className="h-4 w-4" /></Button>
                        <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-black/50 text-white" onClick={() => onZoom('in')}><ZoomIn className="h-4 w-4" /></Button>
                    </>
                 )}
            </div>
            
             <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full z-30">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span>{formatTime(elapsedTime)}</span>
            </div>
        </div>
      );
    }
  
  const mainFrameState = mainView === 'self' ? selfFrame : contactFrame;
  const setMainFrameState = mainView === 'self' ? setSelfFrame : setContactFrame;
  const pipFrameState = mainView === 'self' ? contactFrame : selfFrame;
  const setPipFrameState = mainView === 'self' ? setContactFrame : setSelfFrame;
  
  const handleZoom = (direction: 'in' | 'out') => {
    setMainFrameState(prev => ({
      ...prev,
      size: {
        width: Math.max(320, Math.min(1200, prev.size.width + (direction === 'in' ? 100 : -100))),
        height: Math.max(240, Math.min(900, prev.size.height + (direction === 'in' ? 75 : -75))),
      }
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent id="video-call-dialog-content" className="max-w-full h-screen w-screen p-0 gap-0 bg-gray-900 text-white border-0 sm:rounded-none flex flex-col data-[state=open]:sm:zoom-in-100">
        <DialogHeader className="sr-only">
          <DialogTitle>Video Call with {contact.name}</DialogTitle>
          <DialogDescription>A video call interface.</DialogDescription>
        </DialogHeader>

        <div ref={videoContainerRef} id="video-call-container" className="flex-1 relative overflow-hidden bg-gray-900">
          <DraggableFrame
            frameState={mainView === 'contact' ? contactFrame : selfFrame}
            setFrameState={mainView === 'contact' ? setContactFrame : setSelfFrame}
            videoRef={mainView === 'contact' ? contactVideoRef : selfVideoRef}
            avatar={mainView === 'contact' ? contactAvatar : selfAvatar}
            name={mainView === 'contact' ? contact.name : (self?.name || 'You')}
            isSelf={mainView === 'self'}
            isMain={true}
            onDragStart={(e) => handleDragStart(e, mainView)}
            onZoom={handleZoom}
          />
          <DraggableFrame
            frameState={mainView === 'contact' ? selfFrame : contactFrame}
            setFrameState={mainView === 'contact' ? setSelfFrame : setContactFrame}
            videoRef={mainView === 'contact' ? selfVideoRef : contactVideoRef}
            avatar={mainView === 'contact' ? selfAvatar : contactAvatar}
            name={mainView === 'contact' ? (self?.name || 'You') : contact.name}
            isSelf={mainView !== 'self'}
            isMain={false}
            onDragStart={(e) => handleDragStart(e, mainView === 'self' ? 'contact' : 'self')}
            onSwap={handleSwapViews}
          />
          
          {/* Main Controls - Attached to the main draggable frame */}
          <div 
            className="absolute flex justify-center items-center gap-4 z-30"
            style={{
                left: `${mainFrameState.position.x + mainFrameState.size.width / 2}px`,
                top: `${mainFrameState.position.y + mainFrameState.size.height}px`,
                transform: 'translate(-50%, 1.5rem)',
            }}
          >
              <Button onClick={toggleMic} variant="secondary" size="icon" className={cn("rounded-full h-14 w-14 bg-white/20 text-white hover:bg-white/30", isMuted && 'bg-destructive text-destructive-foreground')}>
                {isMuted ? <MicOff /> : <Mic />}
              </Button>
              <Button onClick={toggleVideo} variant="secondary" size="icon" className={cn("rounded-full h-14 w-14 bg-white/20 text-white hover:bg-white/30", isVideoOff && 'bg-destructive text-destructive-foreground')}>
                {isVideoOff ? <MicOff /> : <Mic />}
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
