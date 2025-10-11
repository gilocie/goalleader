

'use client';

import { CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Phone, Video, MoreVertical, ArrowLeft, Archive, Eraser, Trash2, Play, Pause, Download, MoreHorizontal, Reply, Forward, Plus, VideoIcon, Paperclip, Edit, Copy, Save, XCircle } from 'lucide-react';
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
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useChat } from '@/context/chat-context';
import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { ForwardMessageDialog } from './forward-message-dialog';
import { IncomingCallDialog } from './incoming-call-dialog';
import { VideoCallDialog } from './video-call-dialog';
import { IncomingVoiceCallDialog } from './incoming-voice-call-dialog';
import { VoiceCallDialog } from './voice-call-dialog';
import { format, formatDistanceToNowStrict } from 'date-fns';
import { ConfirmationDialog } from './confirmation-dialog';
import { useUser } from '@/context/user-context';
import { Textarea } from '../ui/textarea';


interface AudioPlayerProps {
    audioUrl: string;
    audioDuration: number;
    isSelf: boolean;
}

const AudioPlayer = ({
  audioUrl,
  audioDuration,
  isSelf,
}: AudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [waveBars, setWaveBars] = useState<number[]>([]);

  useEffect(() => {
    const bars = Array.from({ length: 25 }, () => Math.floor(Math.random() * 20) + 8);
    setWaveBars(bars);
  }, []);

  const togglePlay = () => {
    const player = audioRef.current;
    if (!player) return;
    if (isPlaying) player.pause();
    else player.play();
    setIsPlaying(!isPlaying);
  };

  const handleTime = () => {
    const a = audioRef.current;
    if (!a) return;
    setCurrentTime(a.currentTime);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${m}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Calculate playback progress (0 → 1)
  const progress = audioDuration ? currentTime / audioDuration : 0;

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-xl shadow-sm w-full max-w-[280px] transition-all duration-300",
        isSelf
          ? "bg-primary text-primary-foreground"
          : "bg-white text-gray-800 border border-gray-200"
      )}
    >
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
        onEnded={handleEnded}
        onTimeUpdate={handleTime}
      />

      {/* Play / pause button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={togglePlay}
        className={cn(
          "h-10 w-10 flex-shrink-0 rounded-full transition-all",
          isPlaying
            ? "bg-background/20 hover:bg-background/30 text-white"
            : "bg-background/20 hover:bg-background/30 text-white",
          !isSelf && (isPlaying ? "bg-primary/20 text-primary" : "bg-primary/10 text-primary")
        )}
      >
        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
      </Button>

      {/* Waveform */}
      <div className="relative flex-1 flex items-center h-8 gap-[2px] overflow-hidden">
        {waveBars.map((bar, i) => {
          const barProgress = i / waveBars.length;
          return (
            <div
              key={i}
              className={cn(
                "w-0.5 rounded-sm transition-all duration-200 ease-in-out",
                isSelf ? 'bg-primary-foreground/30' : 'bg-accent'
              )}
              style={{ height: `${bar}px` }}
            />
          );
        })}
        {/* Progress overlay (animated green wave) */}
        <div
          className="absolute top-0 left-0 h-full bg-primary/80 transition-all duration-150"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Duration */}
      <span className={cn("text-xs font-medium tabular-nums ml-2", isSelf ? 'text-primary-foreground/80' : 'text-gray-500')}>
        {formatTime(isPlaying ? currentTime : audioDuration)}
      </span>
    </div>
  );
};


interface ChatMessagesProps {
  messages: Message[];
  selectedContact: Contact;
  onExitChat?: () => void;
  onSendMessage: (message: string, type: 'text' | 'audio' | 'image' | 'file', data?: any) => void;
  onDeleteMessage: (messageId: string, deleteForEveryone: boolean) => void;
  onToggleProfile: () => void;
}

export function ChatMessages({ messages, selectedContact, onExitChat, onSendMessage, onDeleteMessage, onToggleProfile }: ChatMessagesProps) {
  const { self, contacts, isTyping, incomingCallFrom, startCall, endCall, acceptCall, declineCall, acceptedCallContact, setAcceptedCallContact, incomingVoiceCallFrom, startVoiceCall, endVoiceCall, acceptVoiceCall, declineVoiceCall, acceptedVoiceCallContact, setAcceptedVoiceCallContact, clearChat, deleteChat, setInputMessage, updateMessage } = useChat();
  const { user } = useUser();

  if (!user) {
    return null; // Don't render until user is loaded
  }

  const contactAvatar = PlaceHolderImages.find((img) => img.id === selectedContact.id);
  const selfAvatar = self ? PlaceHolderImages.find((img) => img.id === user.id) : undefined;
  const { toast } = useToast();
  const [isImageViewerOpen, setImageViewerOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [editedContent, setEditedContent] = useState('');
  
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [forwardMessage, setForwardMessage] = useState<Message | null>(null);
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
  const [isReceivingCall, setIsReceivingCall] = useState(false);
  const [isVoiceCallOpen, setIsVoiceCallOpen] = useState(false);
  const [isReceivingVoiceCall, setIsReceivingVoiceCall] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const firstUnreadRef = useRef<HTMLDivElement>(null);
  
  const [showWaitDialog, setShowWaitDialog] = useState(false);
  
  const [messageToDelete, setMessageToDelete] = useState<Message | null>(null);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);

  const [confirmation, setConfirmation] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  } | null>(null);

  const isChatEstablished = selectedContact.lastMessageReadStatus !== 'request_sent';

  const handleCallClick = () => { 
    if (!isChatEstablished) {
        setShowWaitDialog(true);
    } else {
        startVoiceCall(selectedContact);
    }
  };
  const handleVideoClick = () => {
    if (!isChatEstablished) {
        setShowWaitDialog(true);
    } else {
        setIsReceivingCall(false);
        startCall(selectedContact);
    }
  };
  const handleImageClick = (imageUrl: string) => { setSelectedImageUrl(imageUrl); setImageViewerOpen(true); };
  const handleAction = (action: 'reply' | 'forward' | 'download' | 'edit', message: Message) => {
    if (action === 'reply') { setReplyTo(message); } 
    else if (action === 'forward') { setForwardMessage(message); }
    else if (action === 'edit' && message.type === 'text') {
        setEditingMessage(message);
        setEditedContent(message.content);
    }
  };
  const handleSendMessageWithContext = (content: string, type: 'text' | 'audio' | 'image' | 'file', data: any = {}) => {
    const messageData = { ...data };
    if (replyTo) { messageData.replyTo = replyTo.id; }
    onSendMessage(content, type, messageData);
    setReplyTo(null);
  };
  
  const handleDeleteRequest = (message: Message) => {
    setMessageToDelete(message);
    setDeleteConfirmationOpen(true);
  };
  
  const confirmDelete = (forEveryone: boolean) => {
    if (messageToDelete) {
        onDeleteMessage(messageToDelete.id, forEveryone);
    }
    setDeleteConfirmationOpen(false);
    setMessageToDelete(null);
  }

  const handleSaveEdit = () => {
    if (editingMessage && editedContent.trim()) {
        updateMessage(editingMessage.id, editedContent);
    }
    setEditingMessage(null);
    setEditedContent('');
  };

  const handleClearChat = () => {
    setConfirmation({
      isOpen: true,
      title: 'Clear Chat History?',
      description: `This will permanently remove all messages in this conversation from your view. This action cannot be undone.`,
      onConfirm: () => {
        clearChat(selectedContact.id);
        toast({ title: "Chat Cleared", description: `Your conversation with ${selectedContact.name} has been cleared.` });
      }
    });
  };

  const handleDeleteChat = () => {
    setConfirmation({
        isOpen: true,
        title: 'Delete Chat?',
        description: `This will delete the chat with ${selectedContact.name} from your conversation list.`,
        onConfirm: () => {
            deleteChat(selectedContact.id);
            toast({ title: "Chat Deleted", description: `The chat with ${selectedContact.name} has been deleted.` });
            if (onExitChat) onExitChat();
        }
    });
  };

  const handleArchiveChat = () => {
    toast({
        title: 'Archive Chat',
        description: 'Archive functionality will be implemented soon.',
    });
  };

  useEffect(() => {
    if (acceptedCallContact) {
      setIsVideoCallOpen(true);
    }
  }, [acceptedCallContact]);

  useEffect(() => {
    if (acceptedVoiceCallContact) {
      setIsVoiceCallOpen(true);
    }
  }, [acceptedVoiceCallContact]);
  
    useEffect(() => {
      if (firstUnreadRef.current) {
          firstUnreadRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (scrollAreaRef.current) {
          const viewport = scrollAreaRef.current.querySelector('div');
          if (viewport) {
              viewport.scrollTop = viewport.scrollHeight;
          }
      }
  }, [messages, selectedContact]);


  if (!self) {
    return null;
  }
  
  const MessageActions = ({ message }: { message: Message }) => {
    const isSelf = message.senderId === self.id;
    const hasAttachment = ['image', 'file', 'audio'].includes(message.type);
    const canEdit = isSelf && message.timestamp && (new Date().getTime() - message.timestamp.toDate().getTime()) < 30 * 60 * 1000;

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
          {canEdit && message.type === 'text' && (
            <DropdownMenuItem onClick={() => handleAction('edit', message)}>
                <Edit className="mr-2 h-4 w-4" /><span>Edit</span>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => handleAction('forward', message)}>
            <Forward className="mr-2 h-4 w-4" /><span>Forward</span>
          </DropdownMenuItem>
          {hasAttachment && (<DropdownMenuItem onClick={() => handleAction('download', message)}><Download className="mr-2 h-4 w-4" /><span>Download</span></DropdownMenuItem>)}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleDeleteRequest(message)} className="text-destructive focus:text-destructive">
            <Trash2 className="mr-2 h-4 w-4" /><span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };
  
  const findMessageById = (id: string) => messages.find(m => m.id === id);

  const firstUnreadIndex = messages.findIndex(m => m.senderId === selectedContact.id && m.readStatus !== 'read');
  
  const visibleMessages = messages.filter(m => {
    if (m.senderId === self.id) return !m.deletedBySender;
    if (m.recipientId === self.id) return !m.deletedByRecipient;
    return true;
  });


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
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div>
                            <Button variant="outline" size="icon" onClick={handleCallClick} disabled={!isChatEstablished}><Phone className="h-4 w-4" /></Button>
                        </div>
                    </TooltipTrigger>
                    {!isChatEstablished && <TooltipContent>Reply to message to enable calls</TooltipContent>}
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                       <div>
                         <Button variant="outline" size="icon" onClick={handleVideoClick} disabled={!isChatEstablished}><Video className="h-4 w-4" /></Button>
                       </div>
                    </TooltipTrigger>
                    {!isChatEstablished && <TooltipContent>Reply to message to enable calls</TooltipContent>}
                </Tooltip>
            </TooltipProvider>
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="outline" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleArchiveChat}><Archive className="mr-2 h-4 w-4" /><span>Archive</span></DropdownMenuItem>
                <DropdownMenuItem onClick={handleClearChat}><Eraser className="mr-2 h-4 w-4" /><span>Clear Chat</span></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDeleteChat} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" /><span>Delete Chat</span></DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <div className="flex-1 overflow-auto">
            <ScrollArea className="h-full" ref={scrollAreaRef}>
              <div className="space-y-4 p-4">
                {visibleMessages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                      No messages yet. Start the conversation!
                  </div>
                ) : (
                  visibleMessages.map((message, index) => {
                    const originalMessage = message.replyTo ? findMessageById(message.replyTo) : null;
                    const isSelf = message.senderId === self.id;
                    const sender = contacts.find(c => c.id === message.senderId) || self;
                    const senderAvatar = PlaceHolderImages.find(p => p.id === sender.id);
                    const showUnreadMarker = index === firstUnreadIndex;
                    const isEdited = message.readStatus === 'updated';
                    const isEditingThisMessage = editingMessage?.id === message.id;

                    if (message.isSystem) {
                      const isVideo = message.callType === 'video';
                      const isVoice = message.callType === 'voice';
                      return (
                        <div key={message.id} className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
                          {isVoice ? <Phone size={14} /> : <VideoIcon size={14} />}
                          <span>{message.content} - {message.timestamp ? format(message.timestamp.toDate(), 'p') : ''}</span>
                        </div>
                      )
                    }

                    return (
                        <div key={message.id}>
                           {showUnreadMarker && (
                                <div ref={firstUnreadRef} className="relative text-center my-4">
                                    <hr className="absolute left-0 right-0 top-1/2 -translate-y-1/2 border-red-500" />
                                    <span className="relative bg-background px-2 text-xs font-semibold text-red-500">New Messages</span>
                                </div>
                            )}
                            <div className={cn('flex items-end gap-2 group', isSelf ? 'justify-end' : 'justify-start')}>
                                {!isSelf && ( <Avatar className="h-8 w-8 self-end"><AvatarImage src={contactAvatar?.imageUrl} alt={selectedContact.name} /><AvatarFallback>{selectedContact.name.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar> )}
                                
                                {isSelf && <MessageActions message={message} />}

                                <div className={cn('max-w-xs md:max-w-md rounded-lg text-sm overflow-hidden', isSelf ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                                    {originalMessage && ( <div className={cn("p-2 text-xs border-b", isSelf ? 'border-primary-foreground/20 bg-black/10' : 'border-border bg-background/50')}><p className="font-semibold">Replying to {originalMessage.senderId === self.id ? 'yourself' : selectedContact.name}</p><p className="truncate opacity-80">{originalMessage.content || originalMessage.type}</p></div> )}
                                    {message.type === 'image' && message.imageUrls && message.imageUrls.length > 0 ? (
                                    <div className="p-1">
                                      <div
                                        className={cn(
                                          "grid gap-1",
                                          message.imageUrls.length > 1 ? "grid-cols-2" : "grid-cols-1"
                                        )}
                                      >
                                        {message.imageUrls.slice(0, 4).map((url, index) => {
                                          const remainingImages = message.imageUrls!.length - 4;
                                          const showMore = index === 3 && remainingImages > 0;
                                          return (
                                            <button
                                              key={index}
                                              onClick={() => handleImageClick(url)}
                                              className={cn(
                                                "relative aspect-square block cursor-pointer overflow-hidden rounded-md group/more",
                                                message.imageUrls && message.imageUrls.length === 1 ? 'w-64' : 'w-36 h-36',
                                                showMore && "bg-black"
                                              )}
                                            >
                                              <Image
                                                src={url}
                                                alt={`attached image ${index + 1}`}
                                                layout="fill"
                                                className={cn(
                                                  "object-cover transition-all",
                                                  showMore && "opacity-30 group-hover/more:opacity-20"
                                                )}
                                              />
                                              {showMore && (
                                                <div className="absolute inset-0 flex items-center justify-center text-white">
                                                  <Plus className="h-6 w-6" />
                                                  <span className="text-xl font-bold">{remainingImages}</span>
                                                </div>
                                              )}
                                            </button>
                                          );
                                        })}
                                      </div>
                                      {message.content && ( <div className="p-3 pt-2"><p className="whitespace-pre-wrap">{message.content}</p></div> )}
                                    </div>
                                    ) : message.type === 'audio' && message.audioUrl && typeof message.audioDuration !== 'undefined' ? (
                                    <div className="p-2">
                                        <AudioPlayer audioUrl={message.audioUrl} audioDuration={message.audioDuration} isSelf={isSelf} />
                                    </div>
                                ) : message.type === 'file' && message.fileName && message.fileUrl ? ( 
                                    <div className="p-2">
                                        <div className="flex items-center gap-3 p-2 rounded-lg bg-background border">
                                            <div className="flex-shrink-0 h-10 w-10 bg-muted rounded-md flex items-center justify-center"><Paperclip className="h-5 w-5 text-muted-foreground" /></div>
                                            <div className="flex-1 min-w-0"><p className="font-medium truncate text-sm">{message.fileName}</p></div>
                                            <a href={message.fileUrl} download={message.fileName}><Button variant="ghost" size="icon"><Download className="h-5 w-5" /></Button></a>
                                        </div>
                                    </div>
                                ) : null}

                                {isEditingThisMessage ? (
                                  <div className="p-2 space-y-2">
                                    <Textarea value={editedContent} onChange={(e) => setEditedContent(e.target.value)} className="bg-background text-foreground h-20" autoFocus />
                                    <div className="flex justify-end gap-2">
                                      <Button variant="ghost" size="sm" onClick={() => setEditingMessage(null)}>Cancel</Button>
                                      <Button size="sm" onClick={handleSaveEdit}>Save</Button>
                                    </div>
                                  </div>
                                ) : (
                                  message.content && message.type === 'text' && ( <div className="p-3"><p className="whitespace-pre-wrap">{message.content}</p></div> )
                                )}

                                <div className={cn("text-xs mt-1 flex items-center justify-end gap-1 px-2 pb-1", isSelf ? 'text-primary-foreground/70' : 'text-muted-foreground/70' )}>
                                    {isEdited && <span className="text-xs italic pr-1">Edited</span>}
                                    <span>{message.timestamp ? format(message.timestamp.toDate(), 'p') : ''}</span>
                                    {isSelf && <ReadIndicator status={message.readStatus} isSelf={true} />}
                                </div>
                            </div>

                            {!isSelf && <MessageActions message={message} />}

                            {isSelf && ( <Avatar className="h-8 w-8 self-end"><AvatarImage src={selfAvatar?.imageUrl} alt="You" data-ai-hint={user.name} /><AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar> )}
                        </div>
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

        <AlertDialog open={deleteConfirmationOpen} onOpenChange={setDeleteConfirmationOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Message</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete this message?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    {messageToDelete?.senderId === self.id && (
                        <AlertDialogAction onClick={() => confirmDelete(true)}>
                            Delete for Everyone
                        </AlertDialogAction>
                    )}
                    <AlertDialogAction onClick={() => confirmDelete(false)}>
                        Delete for Me
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

      <IncomingCallDialog
        isOpen={!!incomingCallFrom}
        onClose={() => declineCall()}
        onDecline={() => declineCall()}
        contact={incomingCallFrom}
        onAccept={() => {
            setIsReceivingCall(true);
            acceptCall();
        }}
      />
      <IncomingVoiceCallDialog 
        isOpen={!!incomingVoiceCallFrom}
        onClose={() => declineVoiceCall()}
        onDecline={() => declineVoiceCall()}
        onAccept={() => {
          setIsReceivingVoiceCall(true);
          acceptVoiceCall();
        }}
        contact={incomingVoiceCallFrom}
      />
      {(isVideoCallOpen || acceptedCallContact) && (
        <VideoCallDialog
          isOpen={isVideoCallOpen || !!acceptedCallContact}
          onClose={() => {
            endCall(acceptedCallContact?.id || selectedContact.id);
            setIsVideoCallOpen(false);
            setAcceptedCallContact(null);
            setIsReceivingCall(false);
          }}
          contact={acceptedCallContact || selectedContact}
          isReceivingCall={isReceivingCall}
        />
      )}
       {(isVoiceCallOpen || acceptedVoiceCallContact) && (
        <VoiceCallDialog
            isOpen={isVoiceCallOpen || !!acceptedVoiceCallContact}
            onClose={() => {
                endVoiceCall(acceptedVoiceCallContact?.id || selectedContact.id);
                setIsVoiceCallOpen(false);
                setAcceptedVoiceCallContact(null);
                setIsReceivingVoiceCall(false);
            }}
            contact={acceptedVoiceCallContact || selectedContact}
            isReceivingCall={isReceivingVoiceCall}
        />
       )}
        {confirmation && (
            <ConfirmationDialog
            isOpen={confirmation.isOpen}
            onOpenChange={() => setConfirmation(null)}
            title={confirmation.title}
            description={confirmation.description}
            onConfirm={confirmation.onConfirm}
            />
        )}
        <AlertDialog open={showWaitDialog} onOpenChange={setShowWaitDialog}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Request Pending</AlertDialogTitle>
                    <AlertDialogDescription>
                        Please wait for ${selectedContact.name} to accept your message request before starting a call.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>OK</AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
  );
}

