
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Settings,
  MoreVertical,
  Camera,
  ChevronLeft,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { Logo } from '../icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface MeetingLobbyProps {
  meetingId: string;
}

interface MediaDevice {
  deviceId: string;
  label: string;
}

const AudioWave = ({ audioLevel }: { audioLevel: number }) => {
    const scale = 1 + audioLevel * 2;
    return (
      <div
        className="absolute inset-0 rounded-full bg-primary/30 transition-transform duration-100"
        style={{
          transform: `scale(${scale})`,
          opacity: audioLevel > 0.01 ? 1 : 0,
        }}
      />
    );
};


export function MeetingLobby({ meetingId }: MeetingLobbyProps) {
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [userName, setUserName] = useState('Zoe S');
  
  const [audioDevices, setAudioDevices] = useState<MediaDevice[]>([]);
  const [videoDevices, setVideoDevices] = useState<MediaDevice[]>([]);
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>('');
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string>('');
  const [audioLevel, setAudioLevel] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>();


  const { toast } = useToast();
  const router = useRouter();
  const userAvatar = PlaceHolderImages.find((img) => img.id === 'user-avatar');

    const processAudio = useCallback(() => {
        if (analyserRef.current) {
            const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
            analyserRef.current.getByteTimeDomainData(dataArray);
            let sumSquares = 0.0;
            for (const amplitude of dataArray) {
                const val = (amplitude - 128) / 128;
                sumSquares += val * val;
            }
            const rms = Math.sqrt(sumSquares / dataArray.length);
            setAudioLevel(rms);
        }
        animationFrameRef.current = requestAnimationFrame(processAudio);
    }, []);


  const getMediaStream = useCallback(async (audioId?: string, videoId?: string) => {
    try {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }

        const constraints: MediaStreamConstraints = {
            audio: audioId ? { deviceId: { exact: audioId } } : true,
            video: videoId ? { deviceId: { exact: videoId } } : true,
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;

        if (videoRef.current) {
            videoRef.current.srcObject = stream;
        }

        const audioTrack = stream.getAudioTracks()[0];
        if (audioTrack) {
            audioTrack.enabled = !isAudioMuted;

            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
                analyserRef.current = audioContextRef.current.createAnalyser();
                analyserRef.current.fftSize = 256;
                const source = audioContextRef.current.createMediaStreamSource(stream);
                source.connect(analyserRef.current);
                processAudio();
            }
        }

        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
            videoTrack.enabled = !isVideoOff;
        }

        setHasCameraPermission(true);

    } catch (error) {
        console.error('Error accessing media devices:', error);
        setHasCameraPermission(false);
        toast({
            variant: 'destructive',
            title: 'Media Access Denied',
            description: 'Please enable camera and microphone permissions.',
        });
    }
  }, [isAudioMuted, isVideoOff, toast, processAudio]);

  const getDevices = useCallback(async () => {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audio = devices.filter(d => d.kind === 'audioinput');
        const video = devices.filter(d => d.kind === 'videoinput');
        
        setAudioDevices(audio);
        setVideoDevices(video);

        if (audio.length > 0 && !selectedAudioDevice) {
            setSelectedAudioDevice(audio[0].deviceId);
        }
        if (video.length > 0 && !selectedVideoDevice) {
            setSelectedVideoDevice(video[0].deviceId);
        }

        // Trigger media stream acquisition now that we have device IDs
        if (audio.length > 0 && video.length > 0) {
            getMediaStream(audio[0].deviceId, video[0].deviceId);
        } else {
             // Fallback for devices without separate device enumeration
             getMediaStream();
        }
        setHasCameraPermission(true);

    } catch (err) {
        console.error('Could not enumerate devices or get permissions', err);
        setHasCameraPermission(false);
        toast({
            variant: 'destructive',
            title: 'Media Access Denied',
            description: 'Please enable camera and microphone permissions.',
        });
    }
  }, [selectedAudioDevice, selectedVideoDevice, toast, getMediaStream]);


  useEffect(() => {
    getDevices();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [getDevices]);

  useEffect(() => {
    if (selectedAudioDevice && selectedVideoDevice) {
        getMediaStream(selectedAudioDevice, selectedVideoDevice);
    }
  }, [selectedAudioDevice, selectedVideoDevice, getMediaStream]);
  
  const toggleAudio = () => {
    const newIsMuted = !isAudioMuted;
    setIsAudioMuted(newIsMuted);
    if (streamRef.current) {
        const audioTrack = streamRef.current.getAudioTracks()[0];
        if (audioTrack) {
            audioTrack.enabled = !newIsMuted;
        }
    }
  };

  const toggleVideo = () => {
    const newIsVideoOff = !isVideoOff;
    setIsVideoOff(newIsVideoOff);
    if (streamRef.current) {
        const videoTrack = streamRef.current.getVideoTracks()[0];
        if (videoTrack) {
            videoTrack.enabled = !newIsVideoOff;
        }
    }
  };


  const handleJoin = () => {
    router.push(`/meetings/${meetingId}`);
  };

  const VideoPreview = () => {
    if (isVideoOff || hasCameraPermission === false) {
      return (
        <div className="bg-gray-900 aspect-video rounded-md flex flex-col items-center justify-center text-white">
            <Avatar className="h-24 w-24">
                <AvatarImage src={userAvatar?.imageUrl} alt={userName} data-ai-hint={userAvatar?.imageHint} />
                <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
            </Avatar>
           {hasCameraPermission === false && (
             <Alert variant="destructive" className="w-auto mt-4">
                <AlertTitle>Camera Access Required</AlertTitle>
                <AlertDescription>
                    Please allow camera access to see your video.
                </AlertDescription>
            </Alert>
           )}
           {hasCameraPermission && isVideoOff && <p className="mt-4">Your camera is off</p>}
        </div>
      );
    }
    
    return <video ref={videoRef} className="w-full aspect-video rounded-md" autoPlay muted playsInline />;
  };

  return (
    <div className="flex items-center justify-center min-h-screen text-white p-4 bg-gradient-to-br from-gray-900 to-gray-800">
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
             <Button 
                onClick={() => router.back()} 
                variant="ghost" 
                size="icon" 
                className="absolute top-1/2 -translate-y-1/2 -left-5 text-white bg-gray-800 hover:bg-gray-700 rounded-full h-10 w-10 z-10 hidden sm:flex"
            >
                <ChevronLeft />
            </Button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 bg-black/50 backdrop-blur-sm rounded-full">
               <Button
                onClick={toggleAudio}
                variant="ghost"
                size="icon"
                className={cn("rounded-full h-10 w-10 text-white relative", !isAudioMuted ? 'hover:bg-gray-700' : 'bg-red-600 hover:bg-red-700')}
              >
                {!isAudioMuted && <AudioWave audioLevel={audioLevel} />}
                {isAudioMuted ? <MicOff /> : <Mic />}
              </Button>
              <Button
                onClick={toggleVideo}
                variant="ghost"
                size="icon"
                className={cn("rounded-full h-10 w-10 text-white", !isVideoOff ? 'hover:bg-gray-700' : 'bg-red-600 hover:bg-red-700')}
              >
                {isVideoOff ? <VideoOff /> : <Video />}
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:bg-gray-700 rounded-full h-10 w-10">
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9.09 9-.28 2.89 2.07.54L13.1 9l-2.89-.28L9.09 9z"/><path d="M14.91 15l.28-2.89-2.07-.54L10.9 15l2.89.28L14.91 15z"/><path d="M12 12.5a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1z"/></svg>
              </Button>
            </div>
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-white hover:bg-gray-700 rounded-full h-10 w-10 bg-black/50 backdrop-blur-sm">
                        <Settings />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Audio Settings</DropdownMenuLabel>
                    <DropdownMenuRadioGroup value={selectedAudioDevice} onValueChange={setSelectedAudioDevice}>
                        {audioDevices.map((device, index) => (
                            <DropdownMenuRadioItem key={device.deviceId} value={device.deviceId}>
                               {device.label || `Microphone ${index + 1}`}
                            </DropdownMenuRadioItem>
                        ))}
                    </DropdownMenuRadioGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Video Settings</DropdownMenuLabel>
                     <DropdownMenuRadioGroup value={selectedVideoDevice} onValueChange={setSelectedVideoDevice}>
                        {videoDevices.map((device, index) => (
                            <DropdownMenuRadioItem key={device.deviceId} value={device.deviceId}>
                               {device.label || `Camera ${index + 1}`}
                            </DropdownMenuRadioItem>
                        ))}
                    </DropdownMenuRadioGroup>
                </DropdownMenuContent>
             </DropdownMenu>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Input
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Your Name"
              className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:ring-primary focus:border-primary"
            />
            <Button
              onClick={handleJoin}
              className="bg-green-600 hover:bg-green-700 text-white font-bold text-base px-8 py-6 w-full sm:w-auto"
            >
              JOIN NOW
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

