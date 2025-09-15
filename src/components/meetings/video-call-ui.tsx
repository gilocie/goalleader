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
  },
  {
    id: 'mia-jones-p2',
    name: 'Mia J.',
    role: 'You',
    isSpeaking: false,
  },
  {
    id: 'janice-wallberg-p3',
    name: 'Janice Wallberg',
    role: 'Participant',
    isSpeaking: false,
  },
  {
    id: 'camille-valdez-p4',
    name: 'Camille Valdez',
    role: 'Participant',
    isSpeaking: true,
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
  },
  { id: 'm4', senderId: 'mia-jones-p2', content: 'Hey all!' },
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
  const [activeTab, setActiveTab] = useState('messages');
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
  
  const mainSpeaker = participants.find(p => p.role === 'You');
  const otherParticipants = participants.filter(p => p.role !== 'You');

  return (
    <div className="flex-1 bg-background flex flex-col h-[calc(100vh-60px)]">
      <div className="flex-1 grid grid-cols-1 md:grid-cols-10 lg:grid-cols-12 overflow-hidden">
        {/* Main Content: Video + Participants */}
        <div className="col-span-1 md:col-span-7 lg:col-span-9 flex flex-col p-4">
          <div className="flex items-center gap-2 mb-4">
            <Users size={20} />
            <span className="font-medium">People attending the call</span>
            <Badge>{participants.length}</Badge>
            <Button variant="outline" size="sm" className="ml-4">
              <Plus className="mr-2 h-4 w-4" />
              Add person to the call
            </Button>
          </div>

          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Main Video */}
            <div className="lg:col-span-10 relative rounded-2xl overflow-hidden bg-muted flex items-center justify-center">
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
               {isVideoOff && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                       <Avatar className="h-24 w-24">
                          <AvatarImage src={PlaceHolderImages.find(p => p.id === 'user-avatar')?.imageUrl} />
                          <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                  </div>
              )}

              {/* Video Controls */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-end gap-2">
                <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm p-2 rounded-full">
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                        <Maximize />
                    </Button>
                    <Button onClick={() => setIsMuted(!isMuted)} variant="ghost" size="icon" className="text-white hover:bg-white/20">
                        {isMuted ? <MicOff /> : <Mic />}
                    </Button>
                    <Button onClick={handleEndCall} size="icon" className="bg-red-500 hover:bg-red-600 rounded-full h-12 w-12">
                        <Phone />
                    </Button>
                    <Button onClick={() => setIsVideoOff(!isVideoOff)} variant="ghost" size="icon" className="text-white hover:bg-white/20">
                        {isVideoOff ? <VideoOff /> : <Video />}
                    </Button>
                     <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                        <Settings />
                    </Button>
                </div>
                 <Card className="p-2 bg-black/40 backdrop-blur-sm border-none">
                    <div className="flex flex-col items-center gap-2 h-24">
                        <Volume2 className="text-white" />
                        <Slider
                            defaultValue={[60]}
                            max={100}
                            step={1}
                            orientation="vertical"
                            className="h-full"
                        />
                    </div>
                </Card>
              </div>
            </div>

            {/* Other Participants */}
            <ScrollArea className="lg:col-span-2">
              <div className="space-y-4 pr-2">
                {otherParticipants.map((p) => {
                    const avatar = PlaceHolderImages.find(img => img.id === p.id);
                    return (
                        <Card key={p.id} className="overflow-hidden relative">
                           <Image src={avatar?.imageUrl || ''} alt={p.name} width={200} height={150} className="w-full object-cover" data-ai-hint={avatar?.imageHint} />
                            <div className="absolute inset-0 bg-black/30"></div>
                           <div className="absolute top-2 left-2 text-white text-sm">
                               <p className="font-semibold">{p.name}</p>
                               <p className="text-xs">{p.role}</p>
                           </div>
                           {p.isSpeaking && (
                                <div className="absolute bottom-2 right-2 p-1.5 bg-green-500 rounded-full">
                                    <Mic className="h-3 w-3 text-white" />
                                </div>
                           )}
                        </Card>
                    )
                })}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Chat Panel */}
        <div className="col-span-1 md:col-span-3 lg:col-span-3 bg-muted/50 border-l flex flex-col">
            <div className="p-4 border-b">
                <h2 className="font-semibold text-lg">Group Chat</h2>
            </div>
            <div className="flex-shrink-0 border-b">
                <div className="grid grid-cols-2 text-center">
                    <button
                        onClick={() => setActiveTab('messages')}
                        className={cn("p-3 font-medium", activeTab === 'messages' && "bg-background border-b-2 border-primary text-primary")}
                    >
                        Messages
                    </button>
                    <button
                        onClick={() => setActiveTab('participants')}
                        className={cn("p-3 font-medium", activeTab === 'participants' && "bg-background border-b-2 border-primary text-primary")}
                    >
                        Participants
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
                                <div key={msg.id} className={cn("flex items-start gap-2", isYou && "justify-end")}>
                                    {!isYou && (
                                         <Avatar className="h-8 w-8">
                                            <AvatarImage src={senderAvatar?.imageUrl} />
                                            <AvatarFallback>{sender?.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                    )}
                                    <div className={cn("max-w-[80%] rounded-lg px-3 py-2", isYou ? 'bg-primary text-primary-foreground' : 'bg-background')}>
                                        {!isYou && <p className="font-semibold text-xs mb-1">{sender?.name}</p>}
                                        <p className="text-sm">{msg.content}</p>
                                    </div>
                                    {isYou && (
                                         <Avatar className="h-8 w-8">
                                            <AvatarImage src={senderAvatar?.imageUrl} />
                                            <AvatarFallback>Y</AvatarFallback>
                                        </Avatar>
                                    )}
                                </div>
                            )
                        })}
                        {isTyping && (
                             <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={PlaceHolderImages.find(p => p.id === 'camille-valdez-p4')?.imageUrl} />
                                    <AvatarFallback>CV</AvatarFallback>
                                </Avatar>
                                <div className="flex items-center gap-1">
                                    <span>Typing</span>
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
                                            <p className="font-semibold">{p.name}</p>
                                            <p className="text-xs text-muted-foreground">{p.role}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Mic className={cn("h-4 w-4", p.isSpeaking && 'text-primary' )} />
                                        <Video className="h-4 w-4" />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </ScrollArea>
            <div className="p-4 border-t">
                <div className="relative">
                    <Input placeholder="Write message..." className="pr-10" />
                    <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2">
                        <Send className="text-primary"/>
                    </Button>
                </div>
            </div>
        </div>
      </div>
      
       {/* Footer / Transcription */}
      <footer className="p-4 border-t bg-muted/30">
        <div className="flex items-center gap-2">
            <div className="w-12 h-5 bg-primary rounded-md flex items-center justify-center text-xs text-primary-foreground font-bold">Now</div>
            <p className="text-sm text-muted-foreground">Your resume is quite impressive. Did you just finish Oxford and now you just...</p>
        </div>
      </footer>
    </div>
  );
}
