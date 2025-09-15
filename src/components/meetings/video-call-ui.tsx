
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Settings,
  Users,
  Plus,
  Maximize,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Phone,
  Volume2,
  MessageSquare,
  Send,
  ScreenShare,
  VolumeX,
  Volume1
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const participants = [
  {
    id: 'john-isner-p1',
    name: 'John Isner',
    role: 'Organizer',
    isSpeaking: true,
    isMuted: false,
  },
  {
    id: 'mia-jones-p2',
    name: 'Mia J.',
    role: 'You',
    isSpeaking: false,
    isMuted: true,
  },
  {
    id: 'janice-wallberg-p3',
    name: 'Janice Wallberg',
    role: 'Participant',
    isSpeaking: false,
    isMuted: false,
  },
  {
    id: 'camille-valdez-p4',
    name: 'Camille Valdez',
    role: 'Participant',
    isSpeaking: true,
    isMuted: false,
  },
];

const messages = [
  {
    id: 'm1',
    senderId: 'john-isner-p1',
    content: 'Welcome everyone, we will start the interview soon.',
  },
  {
    id: 'm2',
    senderId: 'janice-wallberg-p3',
    content: 'Happy to be here John. 😊',
  },
  {
    id: 'm3',
    senderId: 'camille-valdez-p4',
    content: 'My name is Janice. Welcome Jane!',
  }, { id: 'm4', senderId: 'mia-jones-p2', content: 'Hey all!' },
  {
    id: 'm5',
    senderId: 'john-isner-p1',
    content: 'Are we all here? Can we start the interview?',
  },
  {
    id: 'm6',
    senderId: 'mia-jones-p2',
    content: 'I think we need to wait for your other team mates as well. 😊',
  },
  {
    id: 'm7',
    senderId: 'janice-wallberg-p3',
    content: 'We can wait until everybody is present and then start. 👍',
  },
  {
    id: 'm8',
    senderId: 'john-isner-p1',
    content: 'John started a call now',
    isSystem: true,
  },
];

export function VideoCallUI({ meeting }: { meeting: { id: string; title: string, category: string } }) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(true);
  const [isTyping, setIsTyping] = useState(true);
  const [activeTab, setActiveTab] = useState('participants');
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();
  const router = useRouter();

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
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
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

    getCameraPermission();
    
    return () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    }
  }, [toast]);

  const handleEndCall = () => {
    router.push('/meetings');
  };
  
  const mainSpeaker = participants.find(p => p.role === 'Organizer');
  const otherParticipants = participants.filter(p => p.role !== 'Organizer' && p.role !== 'You');
  const selfParticipant = participants.find(p => p.role === 'You');

  const VolumeControl = () => (
    <div className="flex flex-col items-center gap-2 bg-black/40 backdrop-blur-sm p-3 rounded-full">
        <Volume2 className="text-white" />
        <Slider
            defaultValue={[60]}
            max={100}
            step={1}
            orientation="vertical"
            className="h-20"
        />
        <VolumeX className="text-white" />
    </div>
  );

  return (
    <div className="flex-1 bg-background flex flex-col h-[calc(100vh-60px)]">
        {/* Top Bar */}
        <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
                <Users size={20} />
                <span className="font-medium">People attending the call</span>
                <Badge>{participants.length}</Badge>
            </div>
            <Button variant="outline" size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Add person to the call
            </Button>
        </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-10 overflow-hidden">
        {/* Main Content: Video */}
        <div className="col-span-10 md:col-span-7 flex flex-col relative overflow-hidden">
            <div className="absolute inset-0 bg-muted flex items-center justify-center">
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                {!hasCameraPermission && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center p-4">
                        <Alert variant="destructive">
                            <VideoOff className="h-4 w-4" />
                            <AlertTitle>Camera Access Required</AlertTitle>
                            <AlertDescription>
                            Please allow camera access in your browser to use this feature.
                            </AlertDescription>
                        </Alert>
                    </div>
                )}
                {isVideoOff && selfParticipant && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                       <Avatar className="h-40 w-40">
                          <AvatarImage src={PlaceHolderImages.find(p => p.id === selfParticipant.id)?.imageUrl} />
                          <AvatarFallback>{selfParticipant.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                  </div>
              )}
            </div>

            {/* Overlays */}
            <div className="absolute top-5 left-5 flex items-center gap-3">
                {mainSpeaker && (
                    <Card className="overflow-hidden relative min-w-[150px] bg-black/30 text-white border-none shadow-lg">
                        <Image src={PlaceHolderImages.find(img => img.id === mainSpeaker.id)?.imageUrl || ''} alt={mainSpeaker.name} layout='fill' className="object-cover opacity-50" data-ai-hint="man professional office" />
                        <div className="relative p-2 flex items-center gap-2">
                             <Avatar className="h-8 w-8">
                                <AvatarImage src={PlaceHolderImages.find(p => p.id === mainSpeaker.id)?.imageUrl} />
                                <AvatarFallback>{mainSpeaker.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold text-xs">{mainSpeaker.name}</p>
                                <p className="text-xs opacity-80">{mainSpeaker.role}</p>
                            </div>
                        </div>
                    </Card>
                )}
                 <div className="bg-black/30 backdrop-blur-sm text-white px-3 py-1.5 rounded-full flex items-center gap-2 text-sm">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    <span>02:15</span>
                </div>
            </div>

            <div className="absolute top-5 right-5 space-y-3">
                 {otherParticipants.map((p) => {
                        const avatar = PlaceHolderImages.find(img => img.id === p.id);
                        return (
                            <div key={p.id} className="relative">
                                <Avatar className="h-14 w-14 border-2 border-white/50 shadow-lg">
                                    <AvatarImage src={avatar?.imageUrl} data-ai-hint={avatar?.imageHint}/>
                                    <AvatarFallback>{p.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="absolute -bottom-1 -right-1 p-1 bg-black/50 rounded-full">
                                    {p.isMuted ? <MicOff className="h-3 w-3 text-red-500" /> : <Mic className="h-3 w-3 text-green-500" />}
                                </div>
                            </div>
                        )
                    })}
            </div>

            <div className="absolute bottom-5 left-5">
                <VolumeControl />
            </div>

            {/* Video Controls */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-3">
                <Button variant="ghost" size="icon" className="text-white bg-black/40 hover:bg-white/20 rounded-full">
                    <ScreenShare />
                </Button>
                <Button onClick={() => setIsMuted(!isMuted)} variant="ghost" size="icon" className="text-white bg-black/40 hover:bg-white/20 rounded-full">
                    {isMuted ? <MicOff /> : <Mic />}
                </Button>
                <Button onClick={handleEndCall} size="icon" className="bg-red-500 hover:bg-red-600 rounded-full h-14 w-14">
                    <Phone />
                </Button>
                <Button onClick={() => setIsVideoOff(!isVideoOff)} variant="ghost" size="icon" className="text-white bg-black/40 hover:bg-white/20 rounded-full">
                    {isVideoOff ? <VideoOff /> : <Video />}
                </Button>
                <Button variant="ghost" size="icon" className="text-white bg-black/40 hover:bg-white/20 rounded-full">
                    <Settings />
                </Button>
            </div>

             {/* Footer / Transcription */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
                <div className="flex items-center gap-2">
                    <div className="w-12 h-5 bg-primary rounded-md flex items-center justify-center text-xs text-primary-foreground font-bold">Now</div>
                    <p className="text-sm text-white">Your resume is quite impressive. Did you just finish Oxford and now you just...</p>
                </div>
            </div>
        </div>

        {/* Chat Panel */}
        <div className="col-span-10 md:col-span-3 bg-muted/50 border-l flex flex-col">
            <div className="p-4 border-b">
                <h2 className="font-semibold text-lg">Group Chat</h2>
            </div>
            <div className="flex-shrink-0 border-b">
                <div className="grid grid-cols-2 text-center">
                    <button
                        onClick={() => setActiveTab('participants')}
                        className={cn("p-3 font-medium text-sm", activeTab === 'participants' && "bg-background border-b-2 border-primary text-primary")}
                    >
                        Participants
                    </button>
                    <button
                        onClick={() => setActiveTab('messages')}
                        className={cn("p-3 font-medium text-sm", activeTab === 'messages' && "bg-background border-b-2 border-primary text-primary")}
                    >
                        Messages
                    </button>
                </div>
            </div>
            <ScrollArea className="flex-1">
                {activeTab === 'messages' ? (
                     <div className="p-4 space-y-4">
                        {messages.map((msg) => {
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
                                        <AvatarFallback>{sender?.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className={cn("max-w-[80%] rounded-lg px-3 py-2 space-y-1", isYou ? 'bg-primary text-primary-foreground' : 'bg-background')}>
                                        <p className="font-semibold text-xs">{isYou ? 'You' : sender?.name}</p>
                                        <p className="text-sm">{msg.content}</p>
                                    </div>
                                </div>
                            )
                        })}
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
                ): (
                    <div className="p-4 space-y-4">
                        {participants.map(p => {
                             const avatar = PlaceHolderImages.find(img => img.id === p.id);
                             return (
                                <div key={p.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                         <Avatar className="h-10 w-10">
                                            <AvatarImage src={avatar?.imageUrl} data-ai-hint={avatar?.imageHint}/>
                                            <AvatarFallback>{p.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold">{p.name === 'Mia J.' ? 'You' : p.name}</p>
                                            <p className="text-xs text-muted-foreground">{p.role}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Mic className={cn("h-4 w-4", p.isSpeaking ? 'text-primary' : (p.isMuted && 'text-destructive') )} />
                                        <Video className="h-4 w-4" />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </ScrollArea>
            <div className="p-4 border-t bg-background">
                <div className="relative">
                    <Input placeholder="Write message..." className="pr-10 bg-white" />
                    <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2">
                        <Send className="text-primary"/>
                    </Button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
    

    