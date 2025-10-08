

'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Settings,
  Users,
  Plus,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Phone,
  Volume2,
  MessageSquare,
  Send,
  ScreenShare as Monitor,
  VolumeX,
  Bot,
  StopCircle,
  Maximize,
  Minimize,
  LayoutGrid,
  X,
  Circle,
  ChevronLeft,
} from 'lucide-react';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import type { Message } from '@/types/chat';

const initialParticipants = [
  {
    id: 'john-isner-p1',
    name: 'John Isner',
    role: 'Organizer',
    isSpeaking: true,
    isMuted: false,
    isVideoOn: true,
  },
  {
    id: 'mia-jones-p2',
    name: 'Mia J.',
    role: 'You',
    isSpeaking: false,
    isMuted: true,
    isVideoOn: true,
  },
  {
    id: 'janice-wallberg-p3',
    name: 'Janice Wallberg',
    role: 'Participant',
    isSpeaking: false,
    isMuted: false,
    isVideoOn: false,
  },
  {
    id: 'camille-valdez-p4',
    name: 'Camille Valdez',
    role: 'Participant',
    isSpeaking: true,
    isMuted: false,
    isVideoOn: true,
  },
    {
    id: 'oliver-p5',
    name: 'Oliver I',
    role: 'Participant',
    isSpeaking: false,
    isMuted: true,
    isVideoOn: false,
  },
  {
    id: 'simona-p6',
    name: 'Simona V',
    role: 'Participant',
    isSpeaking: false,
    isMuted: false,
    isVideoOn: false,
  },
  {
    id: 'nina-p7',
    name: 'Nina Williams',
    role: 'Participant',
    isSpeaking: false,
    isMuted: false,
    isVideoOn: true,
  },
];

const initialMessages: Omit<Message, 'recipientId'>[] = [
  {
    id: 'm1',
    senderId: 'john-isner-p1',
    content: 'Welcome everyone, we will start the interview soon.',
    timestamp: '10:00 AM',
    type: 'text',
  },
  {
    id: 'm2',
    senderId: 'janice-wallberg-p3',
    content: 'Happy to be here John. 😊',
    timestamp: '10:01 AM',
    type: 'text',
  },
  {
    id: 'm3',
    senderId: 'camille-valdez-p4',
    content: 'My name is Janice. Welcome Jane!',
    timestamp: '10:02 AM',
    type: 'text',
  }, { id: 'm4', senderId: 'mia-jones-p2', content: 'Hey all!', timestamp: '10:03 AM', type: 'text' },
  {
    id: 'm5',
    senderId: 'john-isner-p1',
    content: 'Are we all here? Can we start the interview?',
    timestamp: '10:04 AM',
    type: 'text',
  },
  {
    id: 'm6',
    senderId: 'mia-jones-p2',
    content: 'I think we need to wait for your other team mates as well. 😊',
    timestamp: '10:05 AM',
    type: 'text',
  },
  {
    id: 'm7',
    senderId: 'janice-wallberg-p3',
    content: 'We can wait until everybody is present and then start. 👍',
    timestamp: '10:06 AM',
    type: 'text',
  },
  {
    id: 'm8',
    senderId: 'john-isner-p1',
    content: 'John started a call now',
    timestamp: '10:07 AM',
    isSystem: true,
    type: 'text',
  },
];

interface VideoCallUIProps {
    meeting: { id: string; title: string, category: string };
    initialIsMuted?: boolean;
    initialIsVideoOff?: boolean;
    aiAllowed?: boolean;
}

export function VideoCallUI({ meeting, initialIsMuted = false, initialIsVideoOff = false, aiAllowed = false }: VideoCallUIProps) {
  const [isMuted, setIsMuted] = useState(initialIsMuted);
  const [isVideoOff, setIsVideoOff] = useState(initialIsVideoOff);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(true);
  const [isTyping, setIsTyping] = useState(true);
  const [activeTab, setActiveTab] = useState('participants');
  const [participants, setParticipants] = useState(initialParticipants.map(p => {
    if (p.role === 'You') {
      return { ...p, isMuted: initialIsMuted, isVideoOn: !initialIsVideoOff };
    }
    return p;
  }));
  const [messages, setMessages] = useState<Omit<Message, 'recipientId'>[]>(initialMessages);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [layout, setLayout] = useState<'speaker' | 'grid'>('speaker');
  const [mainParticipantId, setMainParticipantId] = useState(participants.find(p => p.role === 'Organizer')?.id || participants[0].id);

  const [isChatPanelOpen, setIsChatPanelOpen] = useState(true);
  const [speakerVolume, setSpeakerVolume] = useState(60);
  const [isRecording, setIsRecording] = useState(false);


  const videoRef = useRef<HTMLVideoElement>(null);
  const screenShareRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  
  const { toast } = useToast();
  const router = useRouter();

  // Timer for elapsed time
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };


  useEffect(() => {
    if (aiAllowed) {
        setParticipants(prev => [...prev, {
            id: 'goalleader-ai',
            name: 'GoalLeader AI',
            role: 'Assistant',
            isSpeaking: false,
            isMuted: true,
            isVideoOn: false,
        }])
    }
  }, [aiAllowed]);

  useEffect(() => {
    const getCameraPermission = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('Camera API is not available.');
        setHasCameraPermission(false);
         toast({
          variant: 'destructive',
          title: 'Camera Not Supported',
          description: 'Your browser does not support camera access.',
        });
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: !initialIsVideoOff, audio: true });
        streamRef.current = stream;
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        const audioTrack = stream.getAudioTracks()[0];
        if (audioTrack) {
          audioTrack.enabled = !initialIsMuted;
        }

        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.enabled = !initialIsVideoOff;
        }

      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this app.',
        });
      }
    };

    if (!initialIsVideoOff) {
        getCameraPermission();
    }
    
    return () => {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        if (screenStreamRef.current) {
          screenStreamRef.current.getTracks().forEach(track => track.stop());
        }
    }
  }, [initialIsVideoOff, initialIsMuted, toast]);

    const toggleAudio = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);

    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !newMutedState;
      }
    }
    setParticipants(prev => prev.map(p => p.role === 'You' ? { ...p, isMuted: newMutedState } : p));
  };

  const toggleVideo = async () => {
    const newVideoOffState = !isVideoOff;
    setIsVideoOff(newVideoOffState);
    setParticipants(prev => prev.map(p => p.role === 'You' ? { ...p, isVideoOn: !newVideoOffState } : p));
    
    if (!streamRef.current) return;
    const videoTrack = streamRef.current.getVideoTracks()[0];

    if (videoTrack) {
        videoTrack.enabled = !newVideoOffState;
    }

    if (!newVideoOffState && !videoTrack) { // Turning video on when there's no track
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({ video: true });
        const newVideoTrack = newStream.getVideoTracks()[0];
        if (streamRef.current) {
            streamRef.current.addTrack(newVideoTrack);
             if (videoRef.current) {
                videoRef.current.srcObject = streamRef.current;
             }
        }
      } catch (error) {
         console.error('Error starting video:', error);
         toast({ variant: 'destructive', title: 'Video Error', description: 'Could not start video.' });
         setIsVideoOff(true);
         setParticipants(prev => prev.map(p => p.role === 'You' ? { ...p, isVideoOn: false } : p));
      }
    }
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false
        });
        
        screenStreamRef.current = screenStream;
        
        if (screenShareRef.current) {
            screenShareRef.current.srcObject = screenStream;
        }

        setIsScreenSharing(true);
        
        screenStream.getVideoTracks()[0].onended = () => {
          stopScreenShare();
        };
        
        toast({
          title: 'Screen Sharing',
          description: 'You are now sharing your screen.',
        });
      } catch (error) {
        console.error('Error sharing screen:', error);
        toast({
          variant: 'destructive',
          title: 'Screen Share Failed',
          description: 'Could not share screen. Please try again.',
        });
      }
    } else {
      stopScreenShare();
    }
  };

  const stopScreenShare = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }
    setIsScreenSharing(false);
  };

  const handleEndCall = () => {
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    router.push('/meetings');
  };
  
    const toggleFullscreen = async () => {
    const container = document.getElementById('video-call-container');
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
        description: 'Could not toggle fullscreen mode.',
      });
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isCurrentlyFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const mainParticipant = participants.find(p => p.id === mainParticipantId);
  const otherParticipants = participants.filter(p => p.id !== mainParticipantId);

  const VolumeControl = () => (
     <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full h-11 w-11">
            {isSpeakerMuted || speakerVolume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2 bg-black/60 backdrop-blur-sm border-none">
        <div className="flex flex-col items-center gap-2">
            <Slider
                value={[isSpeakerMuted ? 0 : speakerVolume]}
                onValueChange={(value) => {
                setSpeakerVolume(value[0]);
                if (value[0] === 0) {
                    setIsSpeakerMuted(true);
                } else {
                    setIsSpeakerMuted(false);
                }
                }}
                max={100}
                step={1}
                orientation="vertical"
                className="h-24 w-4"
            />
            <span className="text-xs text-white/70">{Math.round(isSpeakerMuted ? 0 : speakerVolume)}</span>
        </div>
      </PopoverContent>
    </Popover>
  );

  const ParticipantCard = ({ participant, isMain }: { participant: (typeof participants)[0], isMain?: boolean }) => {
    const avatar = PlaceHolderImages.find(p => p.id === participant.id);
    const isSelf = participant.role === 'You';
    const isAi = participant.role === 'Assistant';
    const showVideo = isSelf ? !isVideoOff : participant.isVideoOn;

    return (
      <Card
        className={cn(
          "relative aspect-video overflow-hidden bg-black flex items-center justify-center border-2",
          participant.isSpeaking && !isMain ? 'border-primary' : 'border-transparent',
          !isMain && "cursor-pointer hover:border-blue-500"
        )}
        onClick={() => !isMain && setMainParticipantId(participant.id)}
      >
        {isScreenSharing && isMain ? (
          <video ref={screenShareRef} className="w-full h-full object-contain" autoPlay />
        ) : (
          <>
            {showVideo && !isAi ? (
              isSelf ? (
                <video ref={videoRef} className="w-full h-full object-cover scale-x-[-1]" autoPlay muted playsInline />
              ) : (
                <Image src={avatar?.imageUrl || ''} alt={participant.name} layout="fill" className="object-cover" data-ai-hint={avatar?.imageHint}/>
              )
            ) : (
              isAi ? (
                 <div className="h-full w-full flex items-center justify-center bg-background">
                    <Bot className="h-16 w-16 text-primary" />
                 </div>
              ) : (
                <Avatar className={cn("h-16 w-16", isMain && "h-40 w-40")}>
                  {avatar && <AvatarImage src={avatar?.imageUrl} />}
                  <AvatarFallback className="text-xl bg-muted">{participant.name.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                </Avatar>
              )
            )}
          </>
        )}
        
        <div className="absolute bottom-1 left-1 flex items-center gap-1">
          <Badge variant="secondary" className="text-xs bg-black/70 text-white px-2 py-0.5">{isSelf ? 'You' : participant.name}</Badge>
        </div>
        <div className="absolute top-1 right-1 p-1 bg-black/70 rounded-full">
          {participant.isMuted ? <MicOff className="h-3 w-3 text-red-400" /> : <Mic className="h-3 w-3 text-green-400" />}
        </div>
        {isMain && (
           <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/30 text-white text-sm font-medium px-3 py-1.5 rounded-full">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span>{formatTime(elapsedTime)}</span>
            </div>
        )}
      </Card>
    )
  }

  const ParticipantGrid = ({ participants }: { participants: (typeof initialParticipants) }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4 h-full auto-rows-fr">
      {participants.map(p => <ParticipantCard key={p.id} participant={p} />)}
    </div>
  );

  return (
    <div id="video-call-container" className="h-screen max-h-screen bg-background flex flex-col overflow-hidden">
      <div className={cn('flex-1 grid overflow-hidden min-h-0', 'grid-cols-10')}>
        
        {/* Video Area */}
        <div className={cn('flex flex-col relative bg-muted', 'col-span-10 lg:col-span-7', isChatPanelOpen ? 'lg:col-span-7' : 'lg:col-span-10')}>
           <div className="absolute top-4 left-4 z-10">
                <Button onClick={() => router.back()} variant="ghost" size="icon" className="text-white bg-black/30 hover:bg-black/50 rounded-full">
                    <ChevronLeft />
                </Button>
           </div>
          <div className="flex-1 relative overflow-hidden h-full min-h-0">
             {layout === 'grid' || isFullscreen ? (
              <ParticipantGrid participants={participants} />
            ) : (
              mainParticipant && <ParticipantCard participant={mainParticipant} isMain />
            )}
            
            {!hasCameraPermission && !isVideoOff && layout === 'speaker' && !isScreenSharing && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center p-4">
                <Alert variant="destructive">
                  <VideoOff className="h-4 w-4" />
                  <AlertTitle>Camera Access Required</AlertTitle>
                  <AlertDescription>Please allow camera access in your browser to use this feature.</AlertDescription>
                </Alert>
              </div>
            )}
            
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center justify-center p-2 bg-black/60 backdrop-blur-sm rounded-full gap-2 z-50">
              <TooltipProvider>
                 <Tooltip>
                    <TooltipTrigger asChild>
                       <div className="hidden lg:block">
                          <VolumeControl />
                       </div>
                    </TooltipTrigger>
                    <TooltipContent>Volume</TooltipContent>
                 </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button onClick={() => setLayout(prev => prev === 'grid' ? 'speaker' : 'grid')} variant={layout === 'grid' ? 'default' : 'ghost'} size="icon" className={cn("rounded-full h-11 w-11", layout === 'grid' ? 'bg-primary text-primary-foreground' : 'text-white hover:bg-white/20')}>
                            <LayoutGrid className="h-5 w-5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Change Layout</TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                         <Button onClick={() => setIsRecording(!isRecording)} variant={isRecording ? 'destructive' : 'ghost'} size="icon" className={cn("rounded-full h-11 w-11", !isRecording && "text-white hover:bg-white/20")}>
                            <Circle className={cn("h-5 w-5", isRecording && "fill-current animate-pulse")} />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>{isRecording ? 'Stop Recording' : 'Start Recording'}</TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button onClick={toggleScreenShare} variant={isScreenSharing ? "default" : "ghost"} size="icon" className={cn("rounded-full h-11 w-11", isScreenSharing ? "bg-primary text-primary-foreground" : "text-white hover:bg-white/20")}>
                            {isScreenSharing ? <StopCircle className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>{isScreenSharing ? 'Stop Sharing' : 'Share Screen'}</TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button onClick={toggleAudio} variant={isMuted ? "destructive" : "ghost"} size="icon" className={cn("rounded-full h-11 w-11", !isMuted && "text-white hover:bg-white/20")}>
                            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>{isMuted ? 'Unmute' : 'Mute'}</TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button onClick={handleEndCall} size="icon" className="bg-red-500 hover:bg-red-600 rounded-full h-12 w-12">
                            <Phone className="h-5 w-5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>End Call</TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button onClick={toggleVideo} variant={isVideoOff ? "destructive" : "ghost"} size="icon" className={cn("rounded-full h-11 w-11", !isVideoOff && "text-white hover:bg-white/20")}>
                            {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>{isVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}</TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button onClick={toggleFullscreen} variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full h-11 w-11">
                            {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</TooltipContent>
                </Tooltip>
                 <Tooltip>
                    <TooltipTrigger asChild>
                        <Button onClick={() => setIsChatPanelOpen(p => !p)} variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full h-11 w-11 lg:hidden">
                           <MessageSquare className="h-5 w-5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Chat</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className={cn('bg-muted/50 border-l flex-col', 'lg:col-span-3', isChatPanelOpen ? 'flex' : 'hidden')}>
            <div className="flex-shrink-0 border-b">
              <div className="grid grid-cols-2 text-center">
                <button
                  onClick={() => setActiveTab('participants')}
                  className={cn("p-3 font-medium text-sm", activeTab === 'participants' && "bg-background border-b-2 border-primary text-primary")}
                >
                  Participants ({participants.length})
                </button>
                <button
                  onClick={() => setActiveTab('messages')}
                  className={cn("p-3 font-medium text-sm", activeTab === 'messages' && "bg-background border-b-2 border-primary text-primary")}
                >
                  Messages
                </button>
              </div>
            </div>
            <ScrollArea className="flex-1 min-h-0">
              {activeTab === 'messages' ? (
                <div className="p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                      No messages yet.
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const sender = participants.find(p => p.id === msg.senderId);
                      const isYou = sender?.role === 'You';
                      const senderAvatar = PlaceHolderImages.find(p => p.id === msg.senderId);
                      if (msg.isSystem) {
                        return (
                          <div key={msg.id} className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
                            <Phone size={14} />
                            <span>{msg.content}</span>
                          </div>
                        )
                      }
                      return (
                        <div key={msg.id} className={cn("flex items-start gap-2", isYou && "flex-row-reverse")}>
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={senderAvatar?.imageUrl} />
                            <AvatarFallback>{sender?.name.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div className={cn("max-w-[80%] rounded-lg px-3 py-2 space-y-1", isYou ? 'bg-primary text-primary-foreground' : 'bg-background')}>
                            <p className="font-semibold text-xs">{isYou ? 'You' : sender?.name}</p>
                            <p className="text-sm">{msg.content}</p>
                          </div>
                        </div>
                      )
                    })
                  )}
                  {isTyping && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={PlaceHolderImages.find(p => p.id === 'janice-wallberg-p3')?.imageUrl} />
                        <AvatarFallback>JW</AvatarFallback>
                      </Avatar>
                      <div className="flex items-center gap-1">
                        <span>Jane is typing</span>
                        <span className="animate-bounce delay-75">.</span>
                        <span className="animate-bounce delay-150">.</span>
                        <span className="animate-bounce delay-200">.</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-2 space-y-2">
                    {layout === 'speaker' && otherParticipants.map(p => <ParticipantCard key={p.id} participant={p} />)}
                </div>
              )}
            </ScrollArea>
            {activeTab === 'messages' && (
              <div className="flex-shrink-0 p-4 border-t bg-background">
                <div className="relative">
                  <Input placeholder="Type a message..." className="pr-12 bg-white" />
                  <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 hover:bg-primary/10">
                    <Send className="h-4 w-4 text-primary"/>
                  </Button>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
