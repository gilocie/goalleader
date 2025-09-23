
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Paperclip, Mic, Send, Pause, Play, Trash2, Check } from 'lucide-react';
import { Textarea } from '../ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface ChatInputProps {
    onSendMessage: (message: string, type: 'text' | 'audio', audioUrl?: string, duration?: number) => void;
}

const AudioVisualizer = ({ stream, isRecording }: { stream: MediaStream | null, isRecording: boolean }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
  
    useEffect(() => {
      if (!stream || !canvasRef.current || !isRecording) return;
  
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
  
      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
  
      const canvas = canvasRef.current;
      const canvasCtx = canvas.getContext('2d');
      if (!canvasCtx) return;

      let animationFrameId: number;
  
      const draw = () => {
        animationFrameId = requestAnimationFrame(draw);
  
        analyser.getByteTimeDomainData(dataArray);
  
        canvasCtx.fillStyle = 'hsl(var(--background))';
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
  
        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = 'hsl(var(--primary))';
        canvasCtx.beginPath();
  
        const sliceWidth = (canvas.width * 1.0) / bufferLength;
        let x = 0;
  
        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * canvas.height) / 2;
  
          if (i === 0) {
            canvasCtx.moveTo(x, y);
          } else {
            canvasCtx.lineTo(x, y);
          }
  
          x += sliceWidth;
        }
  
        canvasCtx.lineTo(canvas.width, canvas.height / 2);
        canvasCtx.stroke();
      };
  
      draw();
  
      return () => {
        cancelAnimationFrame(animationFrameId);
        source.disconnect();
        analyser.disconnect();
        // Check if context is not already closed to avoid errors
        if (audioContext.state !== 'closed') {
          audioContext.close();
        }
      };
    }, [stream, isRecording]);
  
    return <canvas ref={canvasRef} width="150" height="30" className="transition-all duration-300" />;
};


export function ChatInput({ onSendMessage }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [recordingState, setRecordingState] = useState<'idle' | 'recording' | 'paused'>('idle');
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { toast } = useToast();

  const handleSendMessage = () => {
    if (message.trim()) {
      onSendMessage(message, 'text');
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startRecording = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioStreamRef.current = stream;
        
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;
        audioChunksRef.current = [];

        recorder.ondataavailable = (event) => {
            audioChunksRef.current.push(event.data);
        };
        
        recorder.onstart = () => {
            setRecordingState('recording');
            setRecordingTime(0);
            recordingIntervalRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        };

        recorder.onstop = () => {
            if (recordingIntervalRef.current) {
                clearInterval(recordingIntervalRef.current);
            }
            stream.getTracks().forEach(track => track.stop());
            audioStreamRef.current = null;
        };

        recorder.start();

    } catch (err) {
        console.error("Failed to start recording", err);
        toast({
            variant: "destructive",
            title: "Microphone Access Denied",
            description: "Please allow microphone access in your browser settings.",
        });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recordingState !== 'idle') {
        mediaRecorderRef.current.onstop = () => {
             const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const audioUrl = URL.createObjectURL(audioBlob);
            
            onSendMessage(`Voice Note`, 'audio', audioUrl, recordingTime);
            
            if (recordingIntervalRef.current) {
                clearInterval(recordingIntervalRef.current);
            }
            audioStreamRef.current?.getTracks().forEach(track => track.stop());
            setRecordingState('idle');
            setRecordingTime(0);
        }
        mediaRecorderRef.current.stop();
    }
  };
  
  const pauseOrResumeRecording = () => {
    if (recordingState === 'recording') {
        mediaRecorderRef.current?.pause();
        setRecordingState('paused');
        if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    } else if (recordingState === 'paused') {
        mediaRecorderRef.current?.resume();
        setRecordingState('recording');
        recordingIntervalRef.current = setInterval(() => {
            setRecordingTime(prev => prev + 1);
        }, 1000);
    }
  };

  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
        // Remove onstop listener to prevent sending the message
        mediaRecorderRef.current.onstop = null;
        mediaRecorderRef.current.stop();
    }
    if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    audioStreamRef.current?.getTracks().forEach(track => track.stop());

    setRecordingState('idle');
    setRecordingTime(0);
  }, []);

  useEffect(() => {
      return () => {
          // Cleanup on unmount
          if (recordingState !== 'idle') {
            cancelRecording();
          }
      }
  }, [recordingState, cancelRecording]);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };


  if (recordingState !== 'idle') {
    return (
        <div className="flex items-center justify-between w-full h-10 px-3 py-2 rounded-md border border-input bg-background">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={cancelRecording}>
                    <Trash2 />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={pauseOrResumeRecording}>
                    {recordingState === 'recording' ? <Pause className="text-primary" /> : <Play className="text-primary" />}
                </Button>
            </div>
            <div className="flex items-center gap-2">
                <AudioVisualizer stream={audioStreamRef.current} isRecording={recordingState === 'recording'} />
                <span className="text-sm font-mono text-muted-foreground w-12">{formatTime(recordingTime)}</span>
            </div>
            <Button size="icon" className="h-8 w-8 bg-primary text-primary-foreground" onClick={stopRecording}>
                <Check />
            </Button>
        </div>
    );
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="relative">
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        className="pr-24 pl-20 min-h-[40px] h-10 max-h-40 resize-none"
        rows={1}
      />
      <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
        <Button variant="ghost" size="icon" type="button">
          <Paperclip className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" type="button" onClick={startRecording}>
          <Mic className="h-4 w-4" />
        </Button>
      </div>
       <Button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-primary to-green-700 text-primary-foreground hover:from-primary/90 hover:to-green-700/90" disabled={!message.trim()}>
            <Send className="h-4 w-4 mr-2" />
            Send
        </Button>
    </form>
  );
}
