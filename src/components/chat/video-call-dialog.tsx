
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
  Loader2,
  VolumeX,
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
  size: { width: number; height: number };
  isDragging: boolean;
}

// ---------- Draggable Frame ----------
const DraggableFrame = ({
  frameState,
  videoRef,
  avatar,
  name,
  isMain,
  stream,
  elapsedTime,
  onDragStart,
  onSwap,
  mainControls,
  isSelf,
  callStatus,
}: {
  frameState: DraggableState;
  videoRef: React.RefObject<HTMLVideoElement>;
  avatar?: { imageUrl?: string; imageHint?: string };
  name: string;
  isMain: boolean;
  stream: MediaStream | null;
  elapsedTime: number;
  onDragStart: (e: React.MouseEvent<HTMLDivElement>) => void;
  onSwap?: () => void;
  mainControls?: {
    toggleMic: () => void;
    isMuted: boolean;
    onClose: () => void;
    toggleFullscreen: () => void;
    isFullscreen: boolean;
    toggleSpeakerMute: () => void;
    isSpeakerMuted: boolean;
  };
  isSelf: boolean;
  callStatus: 'connecting' | 'ringing' | 'connected';
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  useEffect(() => {
    if (videoRef.current) {
        videoRef.current.srcObject = stream;
    }
  }, [stream, videoRef]);


  return (
    <div
      className={cn(
        'absolute bg-black rounded-lg overflow-hidden border-2 border-white/20 shadow-2xl group transition-all duration-300 ease-in-out',
        isMain && mainControls?.isFullscreen && 'fullscreen-main'
      )}
      style={{
        top: `${frameState.position.y}px`,
        left: `${frameState.position.x}px`,
        width: `${frameState.size.width}px`,
        height: `${frameState.size.height}px`
      }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-8 cursor-move bg-black/50 z-20 opacity-0 group-hover:opacity-100 transition-opacity"
        onMouseDown={onDragStart}
      />

      <div className="w-full h-full flex items-center justify-center bg-gray-800">
        {stream ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={isSelf} // Mute self view to prevent feedback
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

       {isMain && callStatus !== 'connected' && (
        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-40">
          <p className="text-2xl font-semibold tracking-wide capitalize">
            {callStatus === 'connecting'
              ? 'Calling...'
              : callStatus === 'ringing'
              ? 'Ringing...'
              : 'Connecting...'}
          </p>
        </div>
      )}

      {!isSelf && (
        <div className="absolute bottom-2 left-2 text-white text-sm bg-black/50 px-2 py-1 rounded z-10">
            {name}
        </div>
      )}

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

      {isMain && mainControls && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex justify-center items-center gap-4 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            onClick={mainControls.toggleMic}
            variant="secondary"
            size="icon"
            className={cn(
              'rounded-full h-14 w-14 bg-primary text-primary-foreground hover:bg-primary/90',
              mainControls.isMuted && 'bg-destructive text-destructive-foreground'
            )}
          >
            {mainControls.isMuted ? <MicOff /> : <Mic />}
          </Button>
          <Button
            onClick={mainControls.toggleSpeakerMute}
            variant="secondary"
            size="icon"
            className={cn(
              'rounded-full h-14 w-14 bg-primary text-primary-foreground hover:bg-primary/90',
              mainControls.isSpeakerMuted && 'bg-destructive text-destructive-foreground'
            )}
          >
            {mainControls.isSpeakerMuted ? <VolumeX /> : <Volume2 />}
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
            className="rounded-full h-14 w-14 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {mainControls.isFullscreen ? <Minimize /> : <Maximize />}
          </Button>
        </div>
      )}

       {isMain && callStatus === 'connected' && (
        <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full z-30">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
          <span>{formatTime(elapsedTime)}</span>
        </div>
      )}
    </div>
  );
};

// ---------- Main Dialog ----------
interface VideoCallDialogProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact;
}

export function VideoCallDialog({ isOpen, onClose, contact }: VideoCallDialogProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mainView, setMainView] = useState<'self' | 'contact'>('contact');
  const [callStatus, setCallStatus] = useState<'connecting' | 'ringing' | 'connected'>('connecting');


  const [mainFrame, setMainFrame] = useState<DraggableState>({
    position: { x: 0, y: 0 },
    size: { width: 640, height: 340 },
    isDragging: false
  });

  const [pipFrame, setPipFrame] = useState<DraggableState>({
    position: { x: 0, y: 0 },
    size: { width: 192, height: 144 },
    isDragging: false
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

  // ---- Call Status Simulation ----
  useEffect(() => {
    if (isOpen) {
      setCallStatus('connecting');
      const t1 = setTimeout(() => setCallStatus('ringing'), 2000);
      const t2 = setTimeout(() => setCallStatus('connected'), 5000);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [isOpen]);

  // ---- Elapsed time ----
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen && callStatus === 'connected') {
      setElapsedTime(0);
      timer = setInterval(() => setElapsedTime((t) => t + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, callStatus]);

  // ---- Camera and mic setup ----
  useEffect(() => {
    if (!isOpen) {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      return;
    }

    const getMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        streamRef.current = stream;
      } catch {
        toast({
          variant: 'destructive',
          title: 'Media Access Denied',
          description: 'Please allow camera and microphone access.'
        });
        onClose();
      }
    };

    getMedia();

    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [isOpen, onClose, toast]);

    useEffect(() => {
    const container = videoContainerRef.current;
    if (container) {
      const centerFrames = () => {
        const { width: containerWidth, height: containerHeight } = container.getBoundingClientRect();
        
        let newWidth = Math.min(containerWidth * 0.7, 800);
        let newHeight = newWidth * (9/16);

        if (newHeight > containerHeight * 0.8) {
            newHeight = containerHeight * 0.8;
            newWidth = newHeight * (16/9);
        }

        setMainFrame(prev => ({
          ...prev,
          size: { width: newWidth, height: 340 },
          position: {
            x: (containerWidth - newWidth) / 2,
            y: (containerHeight - 340) / 2
          }
        }));
      };

      centerFrames();
      window.addEventListener('resize', centerFrames);
      return () => window.removeEventListener('resize', centerFrames);
    }
  }, [isOpen]);

  useEffect(() => {
      setPipFrame(prev => ({
          ...prev,
          position: {
              x: mainFrame.position.x,
              y: mainFrame.position.y
          }
      }))
  }, [mainFrame.position]);


  const toggleMic = () => {
    streamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
      setIsMuted(!track.enabled);
    });
  };

  const toggleSpeakerMute = () => {
    setIsSpeakerMuted(prev => !prev);
  }

  const handleSwapViews = () => {
    setMainView((v) => (v === 'self' ? 'contact' : 'self'));
  };

  // ---- Drag setup ----
  const handleDragStart = (
    e: React.MouseEvent<HTMLDivElement>,
    target: 'main' | 'pip'
  ) => {
    e.preventDefault();
    const isMain = target === 'main';
    const frameState = isMain ? mainFrame : pipFrame;
    const setFrame = isMain ? setMainFrame : setPipFrame;
    setFrame((p) => ({ ...p, isDragging: true }));
    dragOffsetRef.current = {
      x: e.clientX - frameState.position.x,
      y: e.clientY - frameState.position.y
    };
  };

  const handleDrag = useCallback(
    (e: MouseEvent) => {
      const isMainDragging = mainFrame.isDragging;
      const isPipDragging = pipFrame.isDragging;
      if (!isMainDragging && !isPipDragging) return;
      const containerRect = videoContainerRef.current?.getBoundingClientRect();
      if (!containerRect) return;
      
      const isMain = isMainDragging;
      const targetFrame = isMain ? mainFrame : pipFrame;
      const setTargetFrame = isMain ? setMainFrame : setPipFrame;
      let newX = e.clientX - dragOffsetRef.current.x;
      let newY = e.clientY - dragOffsetRef.current.y;
      newX = Math.max(0, Math.min(newX, containerRect.width - targetFrame.size.width));
      newY = Math.max(0, Math.min(newY, containerRect.height - targetFrame.size.height));
      setTargetFrame((p) => ({ ...p, position: { x: newX, y: newY } }));
    },
    [mainFrame, pipFrame]
  );

  const handleDragEnd = useCallback(() => {
    setMainFrame((p) => ({ ...p, isDragging: false }));
    setPipFrame((p) => ({ ...p, isDragging: false }));
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleDrag);
    window.addEventListener('mouseup', handleDragEnd);
    return () => {
      window.removeEventListener('mousemove', handleDrag);
      window.removeEventListener('mouseup', handleDragEnd);
    };
  }, [handleDrag, handleDragEnd]);

  // ---- Fullscreen ----
  const toggleFullscreen = async () => {
    const container = document.documentElement; // Target the whole document
    try {
        if (!document.fullscreenElement) {
            if (container.requestFullscreen) {
                await container.requestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                await document.exitFullscreen();
            }
        }
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Fullscreen Error",
            description: "Could not enter fullscreen mode.",
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
    toggleSpeakerMute,
    isSpeakerMuted,
  };

  const MainViewComponent = mainView === 'self' ? (
    <DraggableFrame
      frameState={mainFrame}
      videoRef={selfVideoRef}
      avatar={selfAvatar}
      name={self?.name || 'You'}
      isMain={true}
      isSelf={true}
      stream={streamRef.current}
      elapsedTime={elapsedTime}
      onDragStart={(e) => handleDragStart(e, 'main')}
      mainControls={mainControls}
      callStatus={callStatus}
    />
  ) : (
    <DraggableFrame
      frameState={mainFrame}
      videoRef={contactVideoRef}
      avatar={contactAvatar}
      name={contact.name}
      isMain={true}
      isSelf={false}
      stream={null} // No stream for contact
      elapsedTime={elapsedTime}
      onDragStart={(e) => handleDragStart(e, 'main')}
      mainControls={mainControls}
      callStatus={callStatus}
    />
  );

  const PipViewComponent = mainView === 'self' ? (
    <DraggableFrame
      frameState={pipFrame}
      videoRef={contactVideoRef}
      avatar={contactAvatar}
      name={contact.name}
      isMain={false}
      isSelf={false}
      stream={null}
      elapsedTime={elapsedTime}
      onDragStart={(e) => handleDragStart(e, 'pip')}
      onSwap={handleSwapViews}
      callStatus={callStatus}
    />
  ) : (
    <DraggableFrame
      frameState={pipFrame}
      videoRef={selfVideoRef}
      avatar={selfAvatar}
      name={self?.name || 'You'}
      isMain={false}
      isSelf={true}
      stream={streamRef.current}
      elapsedTime={elapsedTime}
      onDragStart={(e) => handleDragStart(e, 'pip')}
      onSwap={handleSwapViews}
      callStatus={callStatus}
    />
  );


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
            {MainViewComponent}
            {PipViewComponent}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
