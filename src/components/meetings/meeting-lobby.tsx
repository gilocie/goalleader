'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Settings,
  Users,
  Wifi,
  WifiOff,
  Check,
  X,
  Sparkles,
  FlipHorizontal,
  Monitor,
  Volume2,
  ChevronLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Progress } from '../ui/progress';

interface MediaDevice {
  deviceId: string;
  label: string;
}

const AudioVisualizer = ({ audioLevel }: { audioLevel: number }) => (
  <div className="flex items-center gap-1 h-8">
    {[...Array(12)].map((_, i) => (
      <div
        key={i}
        className="w-1 bg-gradient-to-t from-primary to-accent rounded-full transition-all duration-100"
        style={{
          height: `${Math.max(8, audioLevel * 100 * (1 - i * 0.05))}%`,
          opacity: audioLevel > i * 0.08 ? 1 : 0.3,
        }}
      />
    ))}
  </div>
);

export function MeetingLobby({ meetingId }: { meetingId: string }) {
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [userName, setUserName] = useState('');
  const [isBlurred, setIsBlurred] = useState(false);
  const [isMirrored, setIsMirrored] = useState(true);
  const [connectionQuality, setConnectionQuality] = useState<'good' | 'fair' | 'poor'>('good');
  const [participantCount, setParticipantCount] = useState(0);

  const [audioDevices, setAudioDevices] = useState<MediaDevice[]>([]);
  const [videoDevices, setVideoDevices] = useState<MediaDevice[]>([]);
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>('');
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string>('');
  const [audioLevel, setAudioLevel] = useState(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const { toast } = useToast();
  const router = useRouter();

  // FIX: Hydration Mismatch
  useEffect(() => {
    setParticipantCount(Math.floor(Math.random() * 20) + 5);
  }, []);

  // Check connection quality
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const startTime = performance.now();
        await fetch('https://www.google.com/favicon.ico', { mode: 'no-cors' });
        const endTime = performance.now();
        const latency = endTime - startTime;

        if (latency < 100) setConnectionQuality('good');
        else if (latency < 300) setConnectionQuality('fair');
        else setConnectionQuality('poor');
      } catch {
        setConnectionQuality('poor');
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 5000);
    return () => clearInterval(interval);
  }, []);

  const stopCurrentStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    audioContextRef.current = null;
    analyserRef.current = null;
    setAudioLevel(0);
  }, []);

  const startMediaStream = useCallback(async (audioId?: string, videoId?: string) => {
    stopCurrentStream();
    try {
      const constraints: MediaStreamConstraints = {
        audio: audioId ? { deviceId: { exact: audioId }, noiseSuppression: true, echoCancellation: true } : true,
        video: videoId ? { deviceId: { exact: videoId }, width: 1280, height: 720 } : true,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setHasCameraPermission(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        videoRef.current.play().catch(e => console.error("Video play failed", e));
      }

      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioMuted;
      }

      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoOff;
      }

      if (!isAudioMuted) {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);

        audioContextRef.current = audioCtx;
        analyserRef.current = analyser;

        const processAudioLoop = () => {
          if (analyserRef.current) {
            const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
            analyserRef.current.getByteTimeDomainData(dataArray);
            let sumSquares = 0.0;
            for (const amplitude of dataArray) {
              const val = (amplitude - 128) / 128;
              sumSquares += val * val;
            }
            const rms = Math.sqrt(sumSquares / dataArray.length);
            setAudioLevel(rms * 5);
          }
          animationFrameRef.current = requestAnimationFrame(processAudioLoop);
        };
        animationFrameRef.current = requestAnimationFrame(processAudioLoop);
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'Media Access Denied',
        description: 'Please enable camera and microphone permissions.',
      });
    }
  }, [stopCurrentStream, isAudioMuted, isVideoOff, toast]);

  useEffect(() => {
    const initializeMedia = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audio = devices.filter((d) => d.kind === 'audioinput');
        const video = devices.filter((d) => d.kind === 'videoinput');

        setAudioDevices(audio);
        setVideoDevices(video);

        const audioId = audio[0]?.deviceId;
        const videoId = video[0]?.deviceId;
        
        setSelectedAudioDevice(audioId || '');
        setSelectedVideoDevice(videoId || '');

        await startMediaStream(audioId, videoId);

      } catch (err) {
        console.error('Permission denied or no devices found:', err);
        setHasCameraPermission(false);
      }
    };

    initializeMedia();
    return () => {
      stopCurrentStream();
    };
  }, [startMediaStream, stopCurrentStream]);

  const toggleAudio = () => setIsAudioMuted(prev => !prev);
  const toggleVideo = () => setIsVideoOff(prev => !prev);

  useEffect(() => {
    if(streamRef.current) {
        const audioTrack = streamRef.current.getAudioTracks()[0];
        if (audioTrack) audioTrack.enabled = !isAudioMuted;
    }
    // Restart stream to handle audio analyser
    startMediaStream(selectedAudioDevice, selectedVideoDevice);
  }, [isAudioMuted, selectedAudioDevice, selectedVideoDevice, startMediaStream]);

  useEffect(() => {
    if(streamRef.current) {
        const videoTrack = streamRef.current.getVideoTracks()[0];
        if (videoTrack) videoTrack.enabled = !isVideoOff;
    }
  }, [isVideoOff]);

  const checklist = [
    { label: 'Camera working', isChecked: hasCameraPermission === true && !isVideoOff },
    { label: 'Microphone ready', isChecked: hasCameraPermission === true && !isAudioMuted },
    { label: 'Good lighting', isChecked: true },
    { label: 'Professional background', isChecked: isBlurred || isVideoOff },
    { label: 'Connection stable', isChecked: connectionQuality !== 'poor' },
  ];

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-background via-card to-background overflow-hidden">
      <div className="absolute top-4 left-4 z-10 flex items-center gap-4">
        <Button onClick={() => router.back()} variant="outline" size="icon" className="rounded-full">
            <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
            <h1 className="font-semibold text-lg">Job interview for Senior UX Engineer</h1>
            <Badge variant="outline">Design</Badge>
        </div>
      </div>
      <div className="h-full flex items-center justify-center p-4">
        <div className="w-full max-w-7xl grid lg:grid-cols-[1fr,400px] gap-6">
          {/* Left side - Video Preview */}
          <div className="space-y-4">
            {/* Video Preview Card */}
            <Card className="relative overflow-hidden bg-card/50 backdrop-blur-xl border-border/50">
              <div className="aspect-video lg:aspect-video md:aspect-[4/3] sm:aspect-square relative min-h-[300px] md:min-h-[400px]">
                {isVideoOff || hasCameraPermission === false ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Avatar className="h-24 w-24 border-4 border-primary/20">
                      <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-accent text-white">
                        {userName ? userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <p className="mt-4 text-muted-foreground">
                      {hasCameraPermission === false ? 'Camera access required' : 'Camera is off'}
                    </p>
                  </div>
                ) : (
                  <video
                    ref={videoRef}
                    className={cn(
                      "w-full h-full object-cover",
                      isMirrored && "scale-x-[-1]",
                      isBlurred && "blur-md"
                    )}
                    autoPlay
                    playsInline
                    muted
                  />
                )}

                {/* Live indicator */}
                <div className="absolute top-4 left-4">
                  <Badge className="bg-destructive/90 text-destructive-foreground border-0 animate-pulse">
                    <span className="relative flex h-2 w-2 mr-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                    </span>
                    PREVIEW
                  </Badge>
                </div>

                {/* Participants count */}
                <div className="absolute top-4 right-4">
                  <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                    <Users className="w-3 h-3 mr-1" />
                    {participantCount} waiting
                  </Badge>
                </div>

                {/* Controls overlay */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                  <div className="bg-background/80 backdrop-blur-xl rounded-full p-2 flex items-center gap-2">
                    <Button
                      onClick={toggleAudio}
                      size="icon"
                      variant={isAudioMuted ? "destructive" : "secondary"}
                      className="rounded-full h-12 w-12"
                    >
                      {isAudioMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    </Button>
                    <Button
                      onClick={toggleVideo}
                      size="icon"
                      variant={isVideoOff ? "destructive" : "secondary"}
                      className="rounded-full h-12 w-12"
                    >
                      {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                    </Button>
                    
                    <div className="w-px h-8 bg-border mx-1" />
                    
                    <Button
                      onClick={() => setIsBlurred(!isBlurred)}
                      size="icon"
                      variant={isBlurred ? "default" : "secondary"}
                      className="rounded-full h-12 w-12"
                      disabled={isVideoOff}
                    >
                      <Sparkles className="h-5 w-5" />
                    </Button>
                    <Button
                      onClick={() => setIsMirrored(!isMirrored)}
                      size="icon"
                      variant="secondary"
                      className="rounded-full h-12 w-12"
                      disabled={isVideoOff}
                    >
                      <FlipHorizontal className="h-5 w-5" />
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="secondary" className="rounded-full h-12 w-12">
                          <Settings className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-64">
                        <DropdownMenuLabel>Audio Input</DropdownMenuLabel>
                        <DropdownMenuRadioGroup value={selectedAudioDevice} onValueChange={setSelectedAudioDevice}>
                          {audioDevices.map((device) => (
                            <DropdownMenuRadioItem key={device.deviceId} value={device.deviceId}>
                              {device.label || 'Microphone'}
                            </DropdownMenuRadioItem>
                          ))}
                        </DropdownMenuRadioGroup>

                        <DropdownMenuSeparator />

                        <DropdownMenuLabel>Video Input</DropdownMenuLabel>
                        <DropdownMenuRadioGroup value={selectedVideoDevice} onValueChange={setSelectedVideoDevice}>
                          {videoDevices.map((device) => (
                            <DropdownMenuRadioItem key={device.deviceId} value={device.deviceId}>
                              {device.label || 'Camera'}
                            </DropdownMenuRadioItem>
                          ))}
                        </DropdownMenuRadioGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </Card>

            {/* Audio Level Indicator */}
            {!isAudioMuted && (
              <Card className="p-4 bg-card/50 backdrop-blur-xl border-border/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Volume2 className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Audio Level</span>
                  </div>
                  <AudioVisualizer audioLevel={audioLevel} />
                </div>
              </Card>
            )}
          </div>

          {/* Right side - Controls & Info */}
          <div className="space-y-4">
            {/* User Info */}
            <Card className="p-6 bg-card/50 backdrop-blur-xl border-border/50">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium">
                    Your Name
                  </Label>
                  <Input
                    id="name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter your name"
                    className="mt-2 bg-background/50 border-border/50"
                  />
                </div>

                <Button 
                  onClick={() => {
                    if (!userName.trim()) {
                      toast({
                        variant: 'destructive',
                        title: 'Name Required',
                        description: 'Please enter your name before joining.',
                      });
                      return;
                    }
                    toast({
                      title: 'Joining Meeting',
                      description: 'You would be redirected to the meeting room.',
                    });
                    router.push(`/meetings/${meetingId}`);
                  }}
                  className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
                  disabled={!userName.trim()}
                >
                  <Monitor className="mr-2 h-5 w-5" />
                  Join Meeting
                </Button>
              </div>
            </Card>

            {/* Connection Status */}
            <Card className="p-4 bg-card/50 backdrop-blur-xl border-border/50">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Connection Quality</span>
                <div className="flex items-center gap-2">
                  {connectionQuality === 'good' && (
                    <>
                      <Wifi className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-500">Excellent</span>
                    </>
                  )}
                  {connectionQuality === 'fair' && (
                    <>
                      <Wifi className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm text-yellow-500">Fair</span>
                    </>
                  )}
                  {connectionQuality === 'poor' && (
                    <>
                      <WifiOff className="h-4 w-4 text-destructive" />
                      <span className="text-sm text-destructive">Poor</span>
                    </>
                  )}
                </div>
              </div>
            </Card>

            {/* Pre-meeting Checklist */}
            <Card className="p-6 bg-card/50 backdrop-blur-xl border-border/50">
              <h3 className="font-semibold mb-4">Pre-meeting Checklist</h3>
              <div className="space-y-3">
                {checklist.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                    {item.isChecked ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <X className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                ))}
              </div>
              <Progress 
                value={(checklist.filter(item => item.isChecked).length / checklist.length) * 100} 
                className="mt-4 h-2"
              />
            </Card>

            {/* Quick Settings */}
            <Card className="p-6 bg-card/50 backdrop-blur-xl border-border/50">
              <h3 className="font-semibold mb-4">Quick Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="blur" className="text-sm">
                    Background Blur
                  </Label>
                  <Switch
                    id="blur"
                    checked={isBlurred}
                    onCheckedChange={setIsBlurred}
                    disabled={isVideoOff}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="mirror" className="text-sm">
                    Mirror Video
                  </Label>
                  <Switch
                    id="mirror"
                    checked={isMirrored}
                    onCheckedChange={setIsMirrored}
                    disabled={isVideoOff}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="noise" className="text-sm">
                    Noise Cancellation
                  </Label>
                  <Switch
                    id="noise"
                    checked={true}
                    disabled
                  />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
