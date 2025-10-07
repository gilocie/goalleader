
'use client';

import { Card, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Phone, Video, MoreVertical, ArrowLeft, Archive, Eraser, Trash2, Play, Pause, File as FileIcon, Download, MoreHorizontal, X, Reply, Forward } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatInput } from './chat-input';
import { Contact, Message } from '@/types/chat';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '../ui/tooltip';
import { ReadIndicator } from './read-indicator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useChat } from '@/context/chat-context';
import { useRef, useState } from 'react';
import Image from 'next/image';

interface AudioPlayerProps {
    audioUrl: string;
    duration: number;
    isSelf: boolean;
}

const AudioPlayer = ({ audioUrl, duration, isSelf }: AudioPlayerProps) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            const newProgress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
            setProgress(newProgress);
        }
    };

    const handleEnded = () => {
        setIsPlaying(false);
        setProgress(0);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    return (
        <div className="flex items-center gap-2">
            <audio
                ref={audioRef}
                src={audioUrl}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleEnded}
                preload="metadata"
            />
            <Button variant="ghost" size="icon" onClick={togglePlay} className={cn("h-8 w-8 rounded-full", isSelf ? 'text-primary-foreground hover:bg-white/20' : 'text-primary')}>
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <div className="w-24 h-1 bg-muted-foreground/30 rounded-full relative">
                <div 
                    className={cn("h-1 rounded-full absolute", isSelf ? 'bg-primary-foreground' : 'bg-primary')}
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
            <span className={cn("text-xs w-10", isSelf ? 'text-primary-foreground/70' : 'text-muted-foreground' )}>{formatTime(duration)}</span>
        </div>
    );
};

interface ChatMessagesProps {
  messages: Message[];
  selectedContact: Contact;
  onExitChat?: () => void;
  onSendMessage: (message: string, type: 'text' | 'audio' | 'image' | 'file', data?: any) => void;
  onDeleteMessage: (messageId: string) => void;
}

export function ChatMessages({ messages, selectedContact, onExitChat, onSendMessage, onDeleteMessage }: ChatMessagesProps) {
  const { self } = useChat();
  const contactAvatar = PlaceHolderImages.find((img) => img.id === selectedContact.id);
  const selfAvatar = self ? PlaceHolderImages.find((img) => img.id === self.id) : undefined;
  const { toast } = useToast();
  const [isImageViewerOpen, setImageViewerOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

  const handleCallClick = () => {
    toast({
      title: "Calling...",
      description: `Starting a call with ${selectedContact.name}.`,
    });
  };

  const handleVideoClick = () => {
    toast({
      title: "Starting video call...",
      description: `Starting a video call with ${selectedContact.name}.`,
    });
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl);
    setImageViewerOpen(true);
  };

  if (!self) {
    return null; // Or a loading state
  }
  
  const MessageActions = ({ message }: { message: Message }) => {
    const isSelf = message.senderId === self.id;
    const hasAttachment = message.type === 'image' || message.type === 'file' || message.type === 'audio';

    return (
      <div className={cn("transition-opacity opacity-0 group-hover:opacity-100", isSelf ? 'order-first' : 'order-last')}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={isSelf ? "end" : "start"}>
            <DropdownMenuItem>
              <Reply className="mr-2 h-4 w-4" />
              <span>Reply</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Forward className="mr-2 h-4 w-4" />
              <span>Forward</span>
            </DropdownMenuItem>
            {hasAttachment && (
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" />
                <span>Download</span>
              </DropdownMenuItem>
            )}
            {isSelf && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onDeleteMessage(message.id)} className="text-destructive focus:text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

  return (
    <>
      <Card className="h-full flex flex-col rounded-none border-none">
        <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
              {onExitChat && (
                  <TooltipProvider>
                  <Tooltip>
                      <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={onExitChat} className="z-10">
                              <ArrowLeft className="h-5 w-5" />
                          </Button>
                      </TooltipTrigger>
                      <TooltipContent>Back to contacts</TooltipContent>
                  </Tooltip>
                  </TooltipProvider>
              )}
            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarImage src={contactAvatar?.imageUrl} alt={selectedContact.name} data-ai-hint={contactAvatar?.imageHint} />
                <AvatarFallback>{selectedContact.name.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <span
                className={cn(
                  'absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full border-2 border-background',
                  selectedContact.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                )}
              />
            </div>
            <div>
              <p className="font-semibold">{selectedContact.name}</p>
              <p className="text-xs text-muted-foreground">{selectedContact.status}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handleCallClick}>
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleVideoClick}>
              <Video className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Archive className="mr-2 h-4 w-4" />
                  <span>Archive</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Eraser className="mr-2 h-4 w-4" />
                  <span>Clear Chat</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex items-end gap-2 group',
                  message.senderId === self.id ? 'justify-end' : 'justify-start'
                )}
              >
                {message.senderId !== self.id && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={contactAvatar?.imageUrl} alt={selectedContact.name} data-ai-hint={contactAvatar?.imageHint} />
                    <AvatarFallback>{selectedContact.name.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                )}

                <MessageActions message={message} />
                
                <div
                  className={cn(
                    'max-w-[70%] rounded-lg text-sm overflow-hidden group relative', 
                    message.senderId === self.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted',
                     message.type === 'image' && 'p-1 border border-border bg-primary'
                  )}
                >
                   <div className={cn(message.type === 'image' && 'relative w-64 h-48 block cursor-pointer')}>
                    {message.type === 'audio' && message.audioUrl && typeof message.audioDuration !== 'undefined' ? (
                        <div className="p-1"><AudioPlayer audioUrl={message.audioUrl} duration={message.audioDuration} isSelf={message.senderId === self.id} /></div>
                    ) : message.type === 'image' && message.imageUrl ? (
                        <button onClick={() => handleImageClick(message.imageUrl!)} className="relative w-64 h-48 block cursor-pointer">
                            <Image src={message.imageUrl} alt="attached image" layout="fill" className="object-cover rounded-md" />
                        </button>
                    ) : message.type === 'file' && message.fileName && message.fileUrl ? (
                        <div className="p-3">
                            <div className="flex items-center gap-3">
                            <FileIcon className="h-8 w-8" />
                            <div className="flex-1">
                                <p className="font-medium truncate">{message.fileName}</p>
                            </div>
                            <a href={message.fileUrl} download={message.fileName}>
                                <Download className="h-5 w-5" />
                            </a>
                            </div>
                        </div>
                    ) : null}
                  </div>
                  {message.content && (
                    <div className={cn(
                        "p-3",
                        message.type === 'image' && "text-primary"
                    )}>
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                  )}
                  <div className={cn("text-xs mt-1 flex items-center justify-end gap-1 px-2 pb-1", message.senderId === self.id ? 'text-primary-foreground/70' : 'text-muted-foreground/70' )}>
                      <span>{message.timestamp}</span>
                      {message.senderId === self.id && <ReadIndicator status={message.readStatus} isSelf={true} />}
                  </div>
                </div>

                {message.senderId === self.id && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={selfAvatar?.imageUrl} alt="You" data-ai-hint={selfAvatar?.imageHint} />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="p-4 border-t">
          <ChatInput onSendMessage={onSendMessage} />
        </div>
      </Card>

      <Dialog open={isImageViewerOpen} onOpenChange={setImageViewerOpen}>
        <DialogContent className="max-w-4xl h-[90vh] p-2 bg-black/80 border-none flex flex-col">
            <DialogHeader className='flex-shrink-0'>
                <DialogTitle className="sr-only">Image Viewer</DialogTitle>
                <div className="absolute top-2 right-2 z-10 flex gap-2">
                    {selectedImageUrl && (
                         <a href={selectedImageUrl} download="image.png" className={cn(
                            'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
                            'text-white hover:bg-white/10',
                            'h-8 w-8'
                         )}>
                            <Download className="h-5 w-5" />
                        </a>
                    )}
                    <DialogClose asChild>
                       <Button variant={'ghost'} size={'icon'} className="text-white hover:bg-white/10 hover:text-white h-8 w-8">
                        <X className="h-5 w-5" />
                      </Button>
                    </DialogClose>
                </div>
            </DialogHeader>
            <div className="relative w-full h-full flex-1 flex items-center justify-center">
                {selectedImageUrl && (
                    <Image src={selectedImageUrl} alt="Full screen image" fill objectFit="contain" />
                )}
            </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
