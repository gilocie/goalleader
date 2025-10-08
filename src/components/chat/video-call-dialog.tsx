
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
  isDragging: boolean;
}

// ---------- Draggable Frame ----------
const DraggableFrame = ({
  frameState,
  videoRef,
  avatar,
  name,
  isSelf,
  isMain,
  isStreamReady,
  elapsedTime,
  onDragStart,
  onSwap,
  mainControls,
  isVideoOn,
}: {
  frameState: DraggableState;
  videoRef: React.RefObject<HTMLVideoElement>;
  avatar?: { imageUrl?: string; imageHint?: string };
  name: string;
  isSelf: boolean;
  isMain: boolean;
  isStreamReady: boolean;
  elapsedTime: number;
  onDragStart: (e: React.MouseEvent<HTMLDivElement>) => void;
  onSwap?: () => void;
  mainControls?: {
    toggleMic: () => void;
    isMuted: boolean;
    onClose: () => void;
    toggleFullscreen: () => void;
    isFullscreen: boolean;
  };
  isVideoOn: boolean;
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  const showVideo = isSelf ? isStreamReady && isVideoOn : isVideoOn;

  return (
    <div
      className={cn(
        'absolute bg-black rounded-lg overflow-hidden border-2 shadow-2xl group transition-all duration-300 ease-in-out',
        isMain ? 'border-transparent' : 'border-white/20',
        isMain && mainControls?.isFullscreen && 'fullscreen-main'
      )}
      style={{
        top: `${frameState.position.y}px`,
        left: `${frameState.position.x}px`,
        width: isMain ? '640px' : '192px',
        height: isMain ? '480px' : '144px',
      }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-8 cursor-move bg-black/50 z-20 opacity-0 group-hover:opacity-100 transition-opacity"
        onMouseDown={onDragStart}
      />

      <div className="w-full h-full flex items-center justify-center bg-gray-800">
        {showVideo ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={isSelf} // Only self video should be muted by default
            className="w-full h-full object-cover"
            style={{ transform: isSelf ? 'scaleX(-1)' : 'none' }}
          />
        ) : (
          <Avatar className={cn(isMain ? 'w-32 h-32' : 'w-20 h-20')}>
            <AvatarImage
              src={avatar?.imageUrl}
              data-ai-hint={avatar?.imageHint}
            />
            <AvatarFallback className="text-4xl">
              {name.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
        )}
      </div>

      <div className="absolute bottom-2 left-2 text-white text-sm bg-black/50 px-2 py-1 rounded z-10">
        {name}
      </div>

      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-30 flex gap-2">
        {onSwap && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full bg-black/50 text-white"
            onClick={onSwap}
          >
            <Expand className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {isMain && (
         <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full z-30">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
          <span>{formatTime(elapsedTime)}</span>
        </div>
      )}

      {isMain && mainControls && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex justify-center items-center gap-4 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            onClick={mainControls.toggleMic}
            variant="secondary"
            size="icon"
            className={cn(
              'rounded-full h-14 w-14 bg-white/20 text-white hover:bg-white/30',
              mainControls.isMuted && 'bg-destructive text-destructive-foreground'
            )}
          >
            {mainControls.isMuted ? <MicOff /> : <Mic />}
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full h-14 w-14 bg-white/20 text-white hover:bg-white/30"
          >
            <Volume2 />
          </Button>
          <Button
            onClick={mainControls.onClose}
            variant="destructive"
            size="icon"
            className="rounded-full h-14 w-14"
          >
            <Phone className="transform -scale-x-100" />
          </Button>
          <Button
            onClick={mainControls.toggleFullscreen}
            variant="secondary"
            size="icon"
            className="rounded-full h-14 w-14 bg-white/20 text-white hover:bg-white/30"
          >
            {mainControls.isFullscreen ? <Minimize /> : <Maximize />}
          </Button>
        </div>
      )}
    </div>
  );
};

// ---------- Main Dialog ----------
export function VideoCallDialog({ isOpen, onClose, contact }: VideoCallDialogProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mainView, setMainView] = useState<'self' | 'contact'>('contact');
  const [isStreamReady, setIsStreamReady] = useState(false);

  const [selfFrame, setSelfFrame] = useState<DraggableState>({
    position: { x: 20, y: 20 },
    isDragging: false,
  });

  const [contactFrame, setContactFrame] = useState<DraggableState>({
    position: { x: 100, y: 100 },
    isDragging: false,
  });

  const videoContainerRef = useRef<HTMLDivElement>(null);
  const selfVideoRef = useRef<HTMLVideoElement>(null);
  const contactVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  const { toast } = useToast();
  const { self } = useChat();

  const selfAvatar = self
    ? PlaceHolderImages.find((img) => img.id === self.id)
    : undefined;
  const contactAvatar = PlaceHolderImages.find((img) => img.id === contact.id);

  // ---- Call States & Timer ----
  const [callStatus, setCallStatus] = useState<'connecting' | 'ringing' | 'connected'>('connecting');
  useEffect(() => {
    let statusTimer: NodeJS.Timeout;
    if (isOpen) {
      setCallStatus('connecting');
      const connectingTimer = setTimeout(() => {
        setCallStatus('ringing');
        statusTimer = setTimeout(() => {
          setCallStatus('connected');
        }, 3000);
      }, 2000);
      return () => {
        clearTimeout(connectingTimer);
        clearTimeout(statusTimer);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (callStatus === 'connected') {
      setElapsedTime(0);
      timer = setInterval(() => setElapsedTime((t) => t + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [callStatus]);


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

        if (selfVideoRef.current) {
          selfVideoRef.current.srcObject = stream;
        }
        // In a real app, contactVideoRef would get a remote stream
        if (contactVideoRef.current) {
          // Placeholder for remote stream
        }
        
        setIsStreamReady(true);
        setIsVideoOff(false);
      } catch (err) {
        console.error("Media Error:", err);
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

  const handleSwapViews = () => {
    setMainView((v) => (v === 'self' ? 'contact' : 'self'));
  };

  // ---- Drag setup ----
  const handleDragStart = (
    e: React.MouseEvent<HTMLDivElement>,
    target: 'self' | 'contact'
  ) => {
    e.preventDefault();
    const frameState = target === 'self' ? selfFrame : contactFrame;
    const setFrame = target === 'self' ? setSelfFrame : setContactFrame;
    setFrame((p) => ({ ...p, isDragging: true }));
    dragOffsetRef.current = {
      x: e.clientX - frameState.position.x,
      y: e.clientY - frameState.position.y,
    };
  };

  const handleDrag = useCallback(
    (e: MouseEvent) => {
      if (!selfFrame.isDragging && !contactFrame.isDragging) return;
      const containerRect = videoContainerRef.current?.getBoundingClientRect();
      if (!containerRect) return;

      const isSelfDragging = selfFrame.isDragging;
      const targetFrame = isSelfDragging ? selfFrame : contactFrame;
      const setTargetFrame = isSelfDragging ? setSelfFrame : setContactFrame;
      
      const frameWidth = isSelfDragging ? (mainView === 'self' ? 640 : 192) : (mainView === 'contact' ? 640 : 192);
      const frameHeight = isSelfDragging ? (mainView === 'self' ? 480 : 144) : (mainView === 'contact' ? 480 : 144);

      let newX = e.clientX - dragOffsetRef.current.x;
      let newY = e.clientY - dragOffsetRef.current.y;
      
      newX = Math.max(0, Math.min(newX, containerRect.width - frameWidth));
      newY = Math.max(0, Math.min(newY, containerRect.height - frameHeight));
      
      setTargetFrame((p) => ({ ...p, position: { x: newX, y: newY } }));
    },
    [selfFrame.isDragging, contactFrame.isDragging, mainView]
  );

  const handleDragEnd = useCallback(() => {
    setSelfFrame((p) => ({ ...p, isDragging: false }));
    setContactFrame((p) => ({ ...p, isDragging: false }));
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleDrag);
    window.addEventListener('mouseup', handleDragEnd);
    return () => {
      window.removeEventListener('mousemove', handleDrag);
      window.removeEventListener('mouseup', handleDragEnd);
    };
  }, [handleDrag, handleDragEnd]);
  
  // Center main frame on load/swap, attach PiP
  useEffect(() => {
    const container = videoContainerRef.current;
    if (!container) return;

    const mainWidth = 640;
    const mainHeight = 480;
    const pipWidth = 192;
    const pipHeight = 144;

    const mainX = (container.clientWidth - mainWidth) / 2;
    const mainY = (container.clientHeight - mainHeight) / 2;

    const pipX = mainX;
    const pipY = mainY;

    if (mainView === 'self') {
      setSelfFrame(prev => ({...prev, position: { x: mainX, y: mainY }}));
      setContactFrame(prev => ({...prev, position: { x: pipX, y: pipY }}));
    } else {
      setContactFrame(prev => ({...prev, position: { x: mainX, y: mainY }}));
      setSelfFrame(prev => ({...prev, position: { x: pipX, y: pipY }}));
    }
  }, [mainView, isOpen]);


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
        description: 'Could not enter fullscreen mode.',
      });
    }
  };

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const mainControls = {
    toggleMic,
    isMuted,
    onClose,
    toggleFullscreen,
    isFullscreen,
  };

  const mainFrame = mainView === 'self' ? selfFrame : contactFrame;
  const pipFrame = mainView === 'self' ? contactFrame : selfFrame;
  
  return (
    <>
      <style jsx global>{`
        .fullscreen-main {
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          border: none !important;
          border-radius: 0 !important;
        }
      `}</style>

      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          id="video-call-dialog-content"
          className="max-w-full h-screen w-screen p-0 gap-0 text-white border-0 sm:rounded-none flex flex-col bg-transparent shadow-none"
        >
          <DialogHeader className="sr-only">
            <DialogTitle>Video Call with {contact.name}</DialogTitle>
            <DialogDescription>Video call interface</DialogDescription>
          </DialogHeader>

          <div
            ref={videoContainerRef}
            id="video-call-container"
            className="flex-1 relative overflow-hidden"
          >
             {callStatus !== 'connected' && (
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-40 flex items-center justify-center">
                 <div className="text-center space-y-2">
                    <Avatar className="w-40 h-40 mx-auto">
                        <AvatarImage src={contactAvatar?.imageUrl} data-ai-hint={contactAvatar?.imageHint} />
                        <AvatarFallback className="text-5xl">{contact.name.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <p className="font-semibold text-2xl mt-4">{contact.name}</p>
                    <p className="text-lg text-white/70 capitalize">{callStatus}...</p>
                </div>
              </div>
            )}

            {/* Main */}
            <DraggableFrame
              frameState={mainFrame}
              videoRef={mainView === 'self' ? selfVideoRef : contactVideoRef}
              avatar={mainView === 'self' ? selfAvatar : contactAvatar}
              name={mainView === 'self' ? self?.name || 'You' : contact.name}
              isSelf={mainView === 'self'}
              isVideoOn={mainView === 'self' ? !isVideoOff : true}
              isMain={true}
              isStreamReady={isStreamReady}
              elapsedTime={elapsedTime}
              onDragStart={(e) => handleDragStart(e, mainView)}
              mainControls={mainControls}
            />

            {/* PiP */}
            <DraggableFrame
              frameState={pipFrame}
              videoRef={mainView === 'self' ? contactVideoRef : selfVideoRef}
              avatar={mainView === 'self' ? contactAvatar : selfAvatar}
              name={mainView === 'self' ? contact.name : self?.name || 'You'}
              isSelf={mainView !== 'self'}
              isVideoOn={mainView !== 'self' ? !isVideoOff : true}
              isMain={false}
              isStreamReady={isStreamReady}
              elapsedTime={elapsedTime}
              onDragStart={(e) => handleDragStart(e, mainView === 'self' ? 'contact' : 'self')}
              onSwap={handleSwapViews}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
