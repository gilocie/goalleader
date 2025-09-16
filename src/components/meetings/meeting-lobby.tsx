
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Settings,
  MoreVertical,
  Camera,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { Logo } from '../icons';

interface MeetingLobbyProps {
  meetingId: string;
}

export function MeetingLobby({ meetingId }: MeetingLobbyProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [userName, setUserName] = useState('Zoe S');
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
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
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
          description: 'Please enable camera and microphone permissions in your browser settings.',
        });
      }
    };

    getCameraPermission();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [toast]);

  const handleJoin = () => {
    // Here you would pass the settings (isMuted, isVideoOff, userName) to the meeting page
    // For now, just navigate
    router.push(`/meetings/${meetingId}`);
  };

  const VideoPreview = () => {
    if (hasCameraPermission === false || isVideoOff) {
      return (
        <div className="bg-gray-900 aspect-video rounded-md flex flex-col items-center justify-center text-white">
          <Camera className="h-12 w-12 mb-4" />
           {hasCameraPermission === false ? (
             <Alert variant="destructive" className="w-auto">
                <AlertTitle>Camera Access Required</AlertTitle>
                <AlertDescription>
                    Please allow camera access to see your video.
                </AlertDescription>
            </Alert>
           ) : <p>Your camera is off</p>}
        </div>
      );
    }
    
    return <video ref={videoRef} className="w-full aspect-video rounded-md" autoPlay muted playsInline />;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white p-4 bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="w-full max-w-3xl">
        <div className="text-center space-y-2 mb-8">
            <div className="inline-block p-3 bg-gray-700 rounded-full">
                <Logo className="h-8 w-8 text-primary" />
            </div>
          <h1 className="text-4xl font-bold">Get Started</h1>
          <p className="text-gray-400">
            Prepare your audio and video setup before connecting
          </p>
        </div>
        
        <div className="flex items-center justify-center gap-2 mb-8">
            <Badge className="bg-red-600 text-white border-red-600">
                <span className="relative flex h-2 w-2 mr-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                LIVE
            </Badge>
            <p className="text-sm text-gray-300">18 others in session</p>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-lg border border-gray-700">
          <div className="relative mb-4">
             <VideoPreview />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 bg-black/50 backdrop-blur-sm rounded-full">
              <Button
                onClick={() => setIsMuted(!isMuted)}
                variant="ghost"
                size="icon"
                className={cn("rounded-full h-10 w-10 text-white", !isMuted ? 'hover:bg-gray-700' : 'bg-red-600 hover:bg-red-700')}
              >
                {isMuted ? <MicOff /> : <Mic />}
              </Button>
               <Button variant="ghost" size="icon" className="text-white hover:bg-gray-700 rounded-full h-10 w-10">
                <MoreVertical className="h-5 w-5" />
              </Button>
              <Button
                onClick={() => setIsVideoOff(!isVideoOff)}
                variant="ghost"
                size="icon"
                className={cn("rounded-full h-10 w-10 text-white", !isVideoOff ? 'hover:bg-gray-700' : 'bg-red-600 hover:bg-red-700')}
              >
                {isVideoOff ? <VideoOff /> : <Video />}
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:bg-gray-700 rounded-full h-10 w-10">
                <MoreVertical className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:bg-gray-700 rounded-full h-10 w-10">
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9.09 9-.28 2.89 2.07.54L13.1 9l-2.89-.28L9.09 9z"/><path d="M14.91 15l.28-2.89-2.07-.54L10.9 15l2.89.28L14.91 15z"/><path d="M12 12.5a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1z"/></svg>
              </Button>
            </div>
             <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-white hover:bg-gray-700 rounded-full h-10 w-10 bg-black/50 backdrop-blur-sm">
                <Settings />
             </Button>
          </div>
          <div className="flex items-center gap-4">
            <Input
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Your Name"
              className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:ring-primary focus:border-primary"
            />
            <Button
              onClick={handleJoin}
              className="bg-green-600 hover:bg-green-700 text-white font-bold text-base px-8 py-6"
            >
              JOIN NOW
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
