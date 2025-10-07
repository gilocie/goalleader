
'use client';

import { useState, useRef, useEffect, useCallback, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Paperclip, Mic, Send, X, Reply } from 'lucide-react';
import { Textarea } from '../ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import Image from 'next/image';
import { Input } from '../ui/input';
import { Message } from '@/types/chat';
import { cn } from '@/lib/utils';
import { useChat } from '@/context/chat-context';

interface ChatInputProps {
    onSendMessage: (message: string, type: 'text' | 'audio' | 'image' | 'file', data?: any) => void;
    replyTo: Message | null;
    onCancelReply: () => void;
}

const AudioWaveform = ({ stream, isRecording }: { stream: MediaStream | null, isRecording: boolean }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
  
    useEffect(() => {
      if (!stream || !canvasRef.current || !isRecording) {
        // Show static waveform when not recording
        if (canvasRef.current && !isRecording) {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#e2e8f0';
            // Draw static bars
            for (let i = 0; i < 40; i++) {
              const height = Math.random() * 30 + 5;
              ctx.fillRect(i * 8, (canvas.height - height) / 2, 4, height);
            }
          }
        }
        return;
      }
  
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
  
        analyser.getByteFrequencyData(dataArray);
  
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
  
        // Draw waveform bars
        const barWidth = canvas.width / 40;
        for (let i = 0; i < 40; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height * 0.8;
          canvasCtx.fillStyle = i < 20 ? '#6366f1' : '#e2e8f0'; // Blue for active, gray for inactive
          canvasCtx.fillRect(i * barWidth, (canvas.height - barHeight) / 2, barWidth - 2, barHeight || 4);
        }
      };
  
      draw();
  
      return () => {
        cancelAnimationFrame(animationFrameId);
        source.disconnect();
        analyser.disconnect();
        if (audioContext.state !== 'closed') {
          audioContext.close();
        }
      };
    }, [stream, isRecording]);
  
    return (
      <canvas 
        ref={canvasRef} 
        width="320" 
        height="60" 
        className="transition-all duration-300" 
      />
    );
};

const VoiceRecordingDialog = ({ 
  isOpen, 
  onClose, 
  onSend, 
  stream, 
  isRecording, 
  recordingTime 
}: {
  isOpen: boolean;
  onClose: () => void;
  onSend: () => void;
  stream: MediaStream | null;
  isRecording: boolean;
  recordingTime: number;
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}.${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-8 bg-gradient-to-br from-indigo-50 to-purple-50 border-0 shadow-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Record Voice Note</DialogTitle>
          <DialogDescription>
            A dialog for recording a voice note. You can stop, cancel, or send the recording.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-6">
          <h3 className="text-xl font-semibold text-gray-800">Voice Note</h3>
          
          <div className="w-full flex justify-center">
            <AudioWaveform stream={stream} isRecording={isRecording} />
          </div>
          
          <div className="text-2xl font-mono text-gray-700">
            {formatTime(recordingTime)}
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="icon"
              className="w-12 h-12 rounded-full border-gray-300 hover:bg-gray-100"
              onClick={onClose}
            >
              <X className="h-5 w-5 text-gray-600" />
            </Button>
            
            <Button
              size="icon"
              className="w-16 h-16 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg"
            >
              <Mic className="h-6 w-6" />
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              className="w-12 h-12 rounded-full border-gray-300 hover:bg-gray-100"
              onClick={onSend}
            >
              <Send className="h-5 w-5 text-gray-600" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const ImagePreviewDialog = ({
    images,
    onSend,
    onClose,
  }: {
    images: { url: string; file: File }[];
    onSend: (images: { urls: string[]; caption: string }) => void;
    onClose: () => void;
  }) => {
    const [caption, setCaption] = useState('');
  
    if (!images.length) return null;

    const handleSend = () => {
        onSend({ urls: images.map(img => img.url), caption });
    };
  
    return (
      <Dialog open={images.length > 0} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send Images</DialogTitle>
            <DialogDescription>Add a caption to your images before sending.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
             <div className="grid grid-cols-4 gap-2">
                {images.map((image, index) => (
                    <div key={index} className="relative aspect-square w-full overflow-hidden rounded-md">
                        <Image src={image.url} alt={`Image preview ${index + 1}`} layout="fill" objectFit="cover" />
                    </div>
                ))}
            </div>
            <Input
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Add a caption..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSend}>
              <Send className="mr-2 h-4 w-4" />
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

export function ChatInput({ onSendMessage, replyTo, onCancelReply }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [recordingState, setRecordingState] = useState<'idle' | 'recording'>('idle');
  const [recordingTime, setRecordingTime] = useState(0);
  const [showRecordingDialog, setShowRecordingDialog] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<{ url: string; file: File }[]>([]);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { self, selectedContact } = useChat();

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
            setShowRecordingDialog(true);
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
    if (mediaRecorderRef.current && recordingState === 'recording') {
        mediaRecorderRef.current.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const audioUrl = URL.createObjectURL(audioBlob);
            
            onSendMessage(`Voice Note`, 'audio', { audioUrl: audioUrl, duration: recordingTime });
            
            if (recordingIntervalRef.current) {
                clearInterval(recordingIntervalRef.current);
            }
            audioStreamRef.current?.getTracks().forEach(track => track.stop());
            setRecordingState('idle');
            setRecordingTime(0);
            setShowRecordingDialog(false);
        }
        mediaRecorderRef.current.stop();
    }
  };

  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
        mediaRecorderRef.current.onstop = null;
        mediaRecorderRef.current.stop();
    }
    if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    audioStreamRef.current?.getTracks().forEach(track => track.stop());

    setRecordingState('idle');
    setRecordingTime(0);
    setShowRecordingDialog(false);
  }, []);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    const otherFiles = Array.from(files).filter(file => !file.type.startsWith('image/'));

    if (imageFiles.length > 0) {
        const imagePreviews = imageFiles.map(file => ({
            url: URL.createObjectURL(file),
            file: file
        }));
        setImagePreviews(imagePreviews);
    }
    
    otherFiles.forEach(file => {
        const fileUrl = URL.createObjectURL(file);
        onSendMessage(file.name, 'file', { fileName: file.name, fileUrl });
    });

    // Reset file input
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleSendImages = (data: { urls: string[]; caption: string }) => {
    onSendMessage(data.caption || '', 'image', { imageUrls: data.urls });
    setImagePreviews([]);
  };

  useEffect(() => {
      return () => {
          if (recordingState === 'recording') {
            cancelRecording();
          }
      }
  }, [recordingState, cancelRecording]);

  return (
    <>
      <div className="relative">
         {replyTo && (
            <div className="bg-muted p-2 rounded-t-md flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground overflow-hidden">
                    <Reply className="h-4 w-4 flex-shrink-0" />
                    <div className="truncate">
                        <p className="font-semibold">Replying to {replyTo.senderId === self?.id ? 'yourself' : selectedContact?.name}</p>
                        <p className="truncate">{message.content || message.type}</p>
                    </div>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onCancelReply}>
                    <X className="h-4 w-4" />
                </Button>
            </div>
        )}
        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className={cn("relative", replyTo && 'border-t-0 rounded-t-none')}>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*, application/pdf, .doc, .docx, .xls, .xlsx" multiple />
            <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className={cn("pr-24 pl-20 min-h-[40px] h-10 max-h-40 resize-none", replyTo && "rounded-t-none")}
            rows={1}
            />
            <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <Button variant="ghost" size="icon" type="button" onClick={() => fileInputRef.current?.click()}>
                <Paperclip className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" type="button" onClick={startRecording}>
                <Mic className="h-4 w-4" />
            </Button>
            </div>
            <Button 
            type="submit" 
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground hover:bg-primary/90" 
            disabled={!message.trim()}
            >
            <Send className="h-4 w-4 mr-2" />
            Send
            </Button>
        </form>
      </div>

      <VoiceRecordingDialog
        isOpen={showRecordingDialog}
        onClose={cancelRecording}
        onSend={stopRecording}
        stream={audioStreamRef.current}
        isRecording={recordingState === 'recording'}
        recordingTime={recordingTime}
      />
      <ImagePreviewDialog
        images={imagePreviews}
        onSend={handleSendImages}
        onClose={() => setImagePreviews([])}
      />
    </>
  );
}

    