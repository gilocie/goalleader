

'use client';

import { Card, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Phone, Video, MoreVertical, ArrowLeft, Archive, Eraser, Trash2, Play, Pause, File as FileIcon, Download, MoreHorizontal, X, Reply, Forward, Plus } from 'lucide-react';
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
import { ForwardMessageDialog } from './forward-message-dialog';

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
  const { self, contacts } = useChat();
  const contactAvatar = PlaceHolderImages.find((img) => img.id === selectedContact.id);
  const selfAvatar = self ? PlaceHolderImages.find((img) => img.id === self.id) : undefined;
  const { toast } = useToast();
  const [isImageViewerOpen, setImageViewerOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [forwardMessage, setForwardMessage] = useState<Message | null>(null);

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
  
    const handleAction = (action: 'reply' | 'forward' | 'download', message: Message) => {
        if (action === 'reply') {
            setReplyTo(message);
        } else if (action === 'forward') {
            setForwardMessage(message);
        } else if (action === 'download') {
            const urls = message.imageUrls || (message.imageUrl ? [message.imageUrl] : []) || (message.audioUrl ? [message.audioUrl] : []) || (message.fileUrl ? [message.fileUrl] : []);
            if (urls.length > 0) {
                urls.forEach((url, index) => {
                     const a = document.createElement('a');
                    a.href = url;
                    a.download = message.fileName || `download-${message.id}-${index}`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                });
                toast({
                    title: "Downloading...",
                    description: `Your file(s) have started downloading.`,
                });
            } else {
                 toast({
                    variant: 'destructive',
                    title: "Download failed",
                    description: "No downloadable content found for this message.",
                });
            }
        } else {
            toast({
                title: `Action: ${action.charAt(0).toUpperCase() + action.slice(1)}`,
                description: `This feature is not yet implemented.`,
            });
        }
    };
    
    const handleSendMessageWithContext = (content: string, type: 'text' | 'audio' | 'image' | 'file', data: any = {}) => {
        const messageData = { ...data };
        if (replyTo) {
            messageData.replyTo = replyTo.id;
        }
        onSendMessage(content, type, messageData);
        setReplyTo(null);
    }


  if (!self) {
    return null; // Or a loading state
  }
  
  const MessageActions = ({ message }: { message: Message }) => {
    const isSelf = message.senderId === self.id;
    const hasAttachment = message.type === 'image' || message.type === 'file' || message.type === 'audio';

    return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full bg-primary text-primary-foreground hover:bg-primary/80">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={isSelf ? "end" : "start"}>
            <DropdownMenuItem onClick={() => handleAction('reply', message)}>
              <Reply className="mr-2 h-4 w-4" />
              <span>Reply</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAction('forward', message)}>
              <Forward className="mr-2 h-4 w-4" />
              <span>Forward</span>
            </DropdownMenuItem>
            {hasAttachment && (
              <DropdownMenuItem onClick={() => handleAction('download', message)}>
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
    );
  };
  
    const findMessageById = (id: string) => messages.find(m => m.id === id);

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
            {messages.map((message) => {
               const originalMessage = message.replyTo ? findMessageById(message.replyTo) : null;
              return (
                <div
                    key={message.id}
                    className={cn(
                    'flex items-end gap-2 group',
                    message.senderId === self.id ? 'justify-end' : 'justify-start'
                    )}
                >
                    {message.senderId !== self.id && (
                    <Avatar className="h-8 w-8 self-end">
                        <AvatarImage src={contactAvatar?.imageUrl} alt={selectedContact.name} data-ai-hint={contactAvatar?.imageHint} />
                        <AvatarFallback>{selectedContact.name.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    )}

                    {message.senderId === self.id && (
                        <div className="self-center">
                            <MessageActions message={message} />
                        </div>
                    )}

                    <div
                    className={cn(
                        'max-w-[70%] rounded-lg text-sm overflow-hidden relative', 
                        message.senderId === self.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                    >
                    {originalMessage && (
                        <div className={cn(
                            "p-2 text-xs border-b",
                            message.senderId === self.id ? 'border-primary-foreground/20 bg-black/10' : 'border-border bg-background/50'
                        )}>
                            <p className="font-semibold">Replying to {originalMessage.senderId === self.id ? 'yourself' : selectedContact.name}</p>
                            <p className="truncate opacity-80">{originalMessage.content || originalMessage.type}</p>
                        </div>
                    )}
                    {message.type === 'image' && message.imageUrls && message.imageUrls.length > 0 ? (
                         <div className="p-1">
                             <div className="grid grid-cols-2 gap-1">
                                {message.imageUrls.slice(0, 4).map((url, index) => {
                                    const remainingImages = message.imageUrls!.length - 4;
                                    if (index === 3 && remainingImages > 0) {
                                        return (
                                            <button key={index} onClick={() => handleImageClick(url)} className="relative aspect-square w-24 h-24 block cursor-pointer overflow-hidden rounded-md group/more">
                                                <Image src={url} alt={`attached image ${index + 1}`} layout="fill" className="object-cover transition-all group-hover/more:brightness-50" />
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white">
                                                    <Plus className="h-6 w-6" />
                                                    <span className="text-xl font-bold">{remainingImages}</span>
                                                </div>
                                            </button>
                                        )
                                    }
                                    return (
                                        <button key={index} onClick={() => handleImageClick(url)} className="relative aspect-square w-24 h-24 block cursor-pointer overflow-hidden rounded-md">
                                            <Image src={url} alt={`attached image ${index + 1}`} layout="fill" className="object-cover" />
                                        </button>
                                    )
                                })}
                            </div>
                         </div>
                    ) : message.type === 'audio' && message.audioUrl && typeof message.audioDuration !== 'undefined' ? (
                        <div className="p-1"><AudioPlayer audioUrl={message.audioUrl} duration={message.audioDuration} isSelf={message.senderId === self.id} /></div>
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
                    
                    {message.content && (
                         <div className={cn("p-3", message.type !== 'image' && (message.senderId === self.id ? 'text-white' : 'text-primary-foreground'))}>
                           <p className="whitespace-pre-wrap">{message.content}</p>
                        </div>
                    )}
                    <div className={cn("text-xs mt-1 flex items-center justify-end gap-1 px-2 pb-1", message.senderId === self.id ? 'text-primary-foreground/70' : 'text-muted-foreground/70' )}>
                        <span>{message.timestamp}</span>
                        {message.senderId === self.id && <ReadIndicator status={message.readStatus} isSelf={true} />}
                    </div>
                    </div>

                    {message.senderId !== self.id && (
                        <div className="self-center">
                            <MessageActions message={message} />
                        </div>
                    )}

                    {message.senderId === self.id && (
                    <Avatar className="h-8 w-8 self-end">
                        <AvatarImage src={selfAvatar?.imageUrl} alt="You" data-ai-hint={selfAvatar?.imageHint} />
                        <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    )}
                </div>
              )})}
          </div>
        </ScrollArea>
        <div className="p-4 border-t">
          <ChatInput
            onSendMessage={handleSendMessageWithContext}
            replyTo={replyTo}
            onCancelReply={() => setReplyTo(null)}
          />
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
        {forwardMessage && (
            <ForwardMessageDialog
                isOpen={!!forwardMessage}
                onOpenChange={() => setForwardMessage(null)}
                message={forwardMessage}
                contacts={contacts}
            />
        )}
    </>
  );
}
