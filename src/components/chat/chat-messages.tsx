

'use client';

import { CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Phone, Video, MoreVertical, ArrowLeft, Archive, Eraser, Trash2, Play, Pause, Download, MoreHorizontal, Reply, Forward, Plus, VideoIcon } from 'lucide-react';
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useChat } from '@/context/chat-context';
import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { ForwardMessageDialog } from './forward-message-dialog';
import { CallingDialog } from './calling-dialog';
import { IncomingCallDialog } from './incoming-call-dialog';
import { useRouter } from 'next/navigation';
import { VideoCallDialog } from './video-call-dialog';

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
  onToggleProfile: () => void;
}

export function ChatMessages({ messages, selectedContact, onExitChat, onSendMessage, onDeleteMessage, onToggleProfile }: ChatMessagesProps) {
  const { self, contacts, isTyping, incomingCallFrom, activeCallWith, startCall, endCall, acceptCall, declineCall } = useChat();
  const contactAvatar = PlaceHolderImages.find((img) => img.id === selectedContact.id);
  const selfAvatar = self ? PlaceHolderImages.find((img) => img.id === self.id) : undefined;
  const { toast } = useToast();
  const [isImageViewerOpen, setImageViewerOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const router = useRouter();
  
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [forwardMessage, setForwardMessage] = useState<Message | null>(null);
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const handleCallClick = () => { startCall(selectedContact) };
  const handleVideoClick = () => setIsVideoCallOpen(true);
  const handleImageClick = (imageUrl: string) => { setSelectedImageUrl(imageUrl); setImageViewerOpen(true); };
  const handleAction = (action: 'reply' | 'forward' | 'download', message: Message) => {
    if (action === 'reply') { setReplyTo(message); } 
    else if (action === 'forward') { setForwardMessage(message); }
  };
  const handleSendMessageWithContext = (content: string, type: 'text' | 'audio' | 'image' | 'file', data: any = {}) => {
    const messageData = { ...data };
    if (replyTo) { messageData.replyTo = replyTo.id; }
    onSendMessage(content, type, messageData);
    setReplyTo(null);
  };
  
    useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);

  if (!self) {
    return null;
  }
  
  const MessageActions = ({ message }: { message: Message }) => {
    const isSelf = message.senderId === self.id;
    const hasAttachment = ['image', 'file', 'audio'].includes(message.type);
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="default" size="icon" className="h-6 w-6 rounded-full transition-opacity bg-primary text-primary-foreground hover:bg-primary/90">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={isSelf ? "end" : "start"}>
          <DropdownMenuItem onClick={() => handleAction('reply', message)}>
            <Reply className="mr-2 h-4 w-4" /><span>Reply</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAction('forward', message)}>
            <Forward className="mr-2 h-4 w-4" /><span>Forward</span>
          </DropdownMenuItem>
          {hasAttachment && (<DropdownMenuItem onClick={() => handleAction('download', message)}><Download className="mr-2 h-4 w-4" /><span>Download</span></DropdownMenuItem>)}
          {isSelf && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDeleteMessage(message.id)} className="text-destructive focus:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" /><span>Delete</span>
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
      <div className="flex flex-col h-full w-full bg-card">
        <CardHeader className="flex flex-row items-center justify-between p-4 border-b flex-shrink-0">
          <div className="flex items-center gap-3">
              {onExitChat && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={onExitChat} className="z-10 lg:hidden bg-primary text-primary-foreground hover:bg-primary/90 ml-4">
                        <ArrowLeft className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Back to contacts</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            <button className="flex items-center gap-3 text-left" onClick={onToggleProfile}>
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={contactAvatar?.imageUrl} alt={selectedContact.name} />
                  <AvatarFallback>{selectedContact.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className={cn('absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full border-2 border-background', selectedContact.status === 'online' ? 'bg-green-500' : 'bg-gray-400')} />
              </div>
              <div>
                <p className="font-semibold">{selectedContact.name}</p>
                {isTyping ? (
                    <div className="flex items-center gap-1 text-xs text-primary">
                        <span>typing</span>
                        <span className="animate-bounce delay-75">.</span>
                        <span className="animate-bounce delay-150">.</span>
                        <span className="animate-bounce delay-200">.</span>
                    </div>
                ) : (
                    <p className="text-xs text-muted-foreground">{selectedContact.status}</p>
                )}
              </div>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handleCallClick}><Phone className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon" onClick={handleVideoClick}><Video className="h-4 w-4" /></Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="outline" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem><Archive className="mr-2 h-4 w-4" /><span>Archive</span></DropdownMenuItem>
                <DropdownMenuItem><Eraser className="mr-2 h-4 w-4" /><span>Clear Chat</span></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" /><span>Delete</span></DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <div className="flex-1 overflow-auto">
            <ScrollArea className="h-full" ref={scrollAreaRef}>
              <div className="space-y-4 p-4">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                      No messages yet. Start the conversation!
                  </div>
                ) : (
                  messages.map((message) => {
                    const originalMessage = message.replyTo ? findMessageById(message.replyTo) : null;
                    const isSelf = message.senderId === self.id;
                    const sender = contacts.find(c => c.id === message.senderId) || self;
                    const senderAvatar = PlaceHolderImages.find(p => p.id === sender.id);

                    if (message.isSystem) {
                      return (
                        <div key={message.id} className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
                          <VideoIcon size={14} />
                          <span>{message.content}</span>
                        </div>
                      )
                    }

                    return (
                        <div key={message.id} className={cn('flex items-end gap-2 group', isSelf ? 'justify-end' : 'justify-start')}>
                            {!isSelf && ( <Avatar className="h-8 w-8 self-end"><AvatarImage src={contactAvatar?.imageUrl} alt={selectedContact.name} /><AvatarFallback>{selectedContact.name.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar> )}
                            
                            {isSelf && <MessageActions message={message} />}

                            <div className={cn('max-w-xs md:max-w-md rounded-lg text-sm overflow-hidden', isSelf ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                                {originalMessage && ( <div className={cn("p-2 text-xs border-b", isSelf ? 'border-primary-foreground/20 bg-black/10' : 'border-border bg-background/50')}><p className="font-semibold">Replying to {originalMessage.senderId === self.id ? 'yourself' : selectedContact.name}</p><p className="truncate opacity-80">{originalMessage.content || originalMessage.type}</p></div> )}
                                {message.type === 'image' && message.imageUrls && message.imageUrls.length > 0 ? (
                                    <div className="p-1">
                                        <div className="grid grid-cols-2 gap-1">{message.imageUrls.slice(0, 4).map((url, index) => { const remainingImages = message.imageUrls!.length - 4; const showMore = index === 3 && remainingImages > 0; return ( <button key={index} onClick={() => handleImageClick(url)} className={cn("relative aspect-square w-36 h-36 block cursor-pointer overflow-hidden rounded-md group/more", showMore && "bg-black")}> <Image src={url} alt={`attached image ${index + 1}`} layout="fill" className={cn("object-cover transition-all", showMore && 'opacity-30 group-hover/more:opacity-20')} /> {showMore && ( <div className="absolute inset-0 flex items-center justify-center text-white"><Plus className="h-6 w-6" /><span className="text-xl font-bold">{remainingImages}</span></div> )} </button> ) })}</div>
                                        {message.content && ( <div className="p-3 pt-2"><p className="whitespace-pre-wrap">{message.content}</p></div> )}
                                    </div>
                                ) : message.type === 'audio' && message.audioUrl && typeof message.audioDuration !== 'undefined' ? ( <div className="p-1"><AudioPlayer audioUrl={message.audioUrl} duration={message.audioDuration} isSelf={isSelf} /></div>
                                ) : message.type === 'file' && message.fileName && message.fileUrl ? ( <div className="p-3"><div className="flex items-center gap-3"><div className="h-8 w-8" /><div className="flex-1"><p className="font-medium truncate">{message.fileName}</p></div><a href={message.fileUrl} download={message.fileName}><Download className="h-5 w-5" /></a></div></div>
                                ) : null}
                                {message.content && message.type === 'text' && ( <div className="p-3"><p className="whitespace-pre-wrap">{message.content}</p></div> )}
                                <div className={cn("text-xs mt-1 flex items-center justify-end gap-1 px-2 pb-1", isSelf ? 'text-primary-foreground/70' : 'text-muted-foreground/70' )}><span>{message.timestamp}</span>{isSelf && <ReadIndicator status={message.readStatus} isSelf={true} />}</div>
                            </div>

                            {!isSelf && <MessageActions message={message} />}

                            {isSelf && ( <Avatar className="h-8 w-8 self-end"><AvatarImage src={selfAvatar?.imageUrl} alt="You" /><AvatarFallback>U</AvatarFallback></Avatar> )}
                        </div>
                    )
                  })
                )}
              </div>
            </ScrollArea>
        </div>

        <div className="p-4 border-t flex-shrink-0 bg-card">
          <ChatInput
            onSendMessage={handleSendMessageWithContext}
            replyTo={replyTo}
            onCancelReply={() => setReplyTo(null)}
          />
        </div>
      </div>
        
      <Dialog open={isImageViewerOpen} onOpenChange={setImageViewerOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Image Viewer</DialogTitle>
            <DialogDescription>Viewing attached image.</DialogDescription>
          </DialogHeader>
          {selectedImageUrl && <Image src={selectedImageUrl} alt="Full screen image" layout="responsive" width={1920} height={1080} className="object-contain max-h-[80vh]" />}
        </DialogContent>
      </Dialog>
      {forwardMessage && (<ForwardMessageDialog isOpen={!!forwardMessage} onOpenChange={() => setForwardMessage(null)} message={forwardMessage} contacts={contacts} />)}
      {activeCallWith && (
        <CallingDialog
          isOpen={!!activeCallWith}
          onClose={(duration: number) => endCall(duration)}
          contact={activeCallWith}
        />
      )}
      <IncomingCallDialog
        isOpen={!!incomingCallFrom}
        onClose={() => declineCall()}
        onDecline={() => declineCall()}
        contact={incomingCallFrom}
        onAccept={acceptCall}
      />
      {isVideoCallOpen && (
        <VideoCallDialog
          isOpen={isVideoCallOpen}
          onClose={() => setIsVideoCallOpen(false)}
          contact={selectedContact}
        />
      )}
    </>
  );
}
