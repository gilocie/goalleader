
'use client';

import { Card, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Phone, Video, MoreVertical, ArrowLeft, Archive, Eraser, Trash2 } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';

interface ChatMessagesProps {
  messages: Message[];
  selectedContact: Contact;
  self: Contact;
  onExitChat?: () => void;
  onSendMessage: (message: string) => void;
}

export function ChatMessages({ messages, selectedContact, self, onExitChat, onSendMessage }: ChatMessagesProps) {
  const contactAvatar = PlaceHolderImages.find((img) => img.id === selectedContact.id);
  const selfAvatar = PlaceHolderImages.find((img) => img.id === self.id);
  const { toast } = useToast();

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

  return (
    <Card className="h-full flex flex-col rounded-none border-none">
      <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
            <TooltipProvider>
              <Tooltip>
                  <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={onExitChat} className="md:hidden">
                          <ArrowLeft className="h-5 w-5" />
                      </Button>
                  </TooltipTrigger>
                  <TooltipContent>Back to contacts</TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
                'flex items-end gap-2',
                message.senderId === self.id ? 'justify-end' : 'justify-start'
              )}
            >
              {message.senderId !== self.id && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={contactAvatar?.imageUrl} alt={selectedContact.name} data-ai-hint={contactAvatar?.imageHint} />
                  <AvatarFallback>{selectedContact.name.slice(0, 2)}</AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  'max-w-[70%] rounded-lg p-3 text-sm whitespace-pre-wrap',
                  message.senderId === self.id
                    ? 'bg-primary text-primary-foreground rounded-br-none'
                    : 'bg-muted rounded-bl-none'
                )}
              >
                <p>{message.content}</p>
                 <div className={cn("text-xs mt-1 flex items-center justify-end gap-1", message.senderId === self.id ? 'text-primary-foreground/70' : 'text-muted-foreground/70' )}>
                    <span>{message.timestamp}</span>
                    {message.senderId === self.id && <ReadIndicator status={message.readStatus} />}
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
  );
}
