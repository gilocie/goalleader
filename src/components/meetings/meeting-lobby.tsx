'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Settings,
  ChevronLeft,
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
import { Slider } from '../ui/slider';

interface MeetingLobbyProps {
  meetingId: string;
}

interface MediaDevice {
  deviceId: string;
  label: string;
}

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

  const stopCurrentStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if(animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setAudioLevel(0);
  }, []);

  const startMediaStream = useCallback(async (audioId?: string, videoId?: string) => {
    try {
      stopCurrentStream();

      const constraints: MediaStreamConstraints = {
        audio: audioId ? { deviceId: { exact: audioId } } : { noiseSuppression: true, echoCancellation: true },
        video: videoId ? { deviceId: { exact: videoId }, width: 1280, height: 720 } : { width: 1280, height: 720 },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioMuted;
      }
      
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoOff;
      }

      const processAudio = () => {
        if (analyserRef.current) {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteTimeDomainData(dataArray);
          let sumSquares = 0.0;
          for (const amplitude of dataArray) {
            const val = (amplitude - 128) / 128;
            sumSquares += val * val;
          }
          const rms = Math.sqrt(sumSquares / dataArray.length);
          const level = Math.min(1, rms * 5);
          setAudioLevel(level);
          animationFrameRef.current = requestAnimationFrame(processAudio);
        }
      };

      if (audioTrack && !isAudioMuted) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
        const source = audioContextRef.current.createMediaStreamSource(stream);
        source.connect(analyserRef.current);
        processAudio();
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
  }, [isAudioMuted, isVideoOff, toast, stopCurrentStream]);


  useEffect(() => {
    const initializeMedia = async () => {
      try {
        // First, just get permission. This avoids devices changing IDs.
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        // Stop these tracks immediately, we only needed them for permission
        stream.getTracks().forEach(track => track.stop());
        setHasCameraPermission(true);

        const devices = await navigator.mediaDevices.enumerateDevices();
        const audio = devices.filter(d => d.kind === 'audioinput');
        const video = devices.filter(d => d.kind === 'videoinput');
        
        setAudioDevices(audio);
        setVideoDevices(video);

        const defaultAudioId = audio[0]?.deviceId;
        const defaultVideoId = video[0]?.deviceId;

        if (defaultAudioId) setSelectedAudioDevice(defaultAudioId);
        if (defaultVideoId) setSelectedVideoDevice(defaultVideoId);

        // Now, start the stream with the default devices
        await startMediaStream(defaultAudioId, defaultVideoId);

      } catch (err) {
        console.error('Permission denied or no devices found:', err);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Media Access Denied',
          description: 'Please enable camera and microphone permissions in your browser settings.',
        });
      }
    };
    
    initializeMedia();

    return () => {
      stopCurrentStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Re-stream only when selected devices change and we have permission
    if (hasCameraPermission && (selectedAudioDevice || selectedVideoDevice)) {
        startMediaStream(selectedAudioDevice, selectedVideoDevice);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAudioDevice, selectedVideoDevice, hasCameraPermission]);
  
  const toggleAudio = () => {
    const newMutedState = !isAudioMuted;
    setIsAudioMuted(newMutedState);
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !newMutedState;
        if(newMutedState && animationFrameRef.current){
           cancelAnimationFrame(animationFrameRef.current);
           setAudioLevel(0);
        } else if(!newMutedState) {
           startMediaStream(selectedAudioDevice, selectedVideoDevice);
        }
      }
    }
  };

  const toggleVideo = () => {
    const newVideoOffState = !isVideoOff;
    setIsVideoOff(newVideoOffState);
     if (streamRef.current) {
        const videoTrack = streamRef.current.getVideoTracks()[0];
        if (videoTrack) {
            videoTrack.enabled = !newVideoOffState;
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

  const VolumeControl = () => (
    <div className="flex flex-col items-center gap-2 bg-black/40 backdrop-blur-sm p-3 rounded-full">
      <Slider
        defaultValue={[0]}
        value={[isAudioMuted ? 0 : audioLevel * 100]}
        max={100}
        step={1}
        orientation="vertical"
        className="h-20"
      />
    </div>
  );

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
            <div className="absolute bottom-4 left-4">
              <VolumeControl />
            </div>
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
