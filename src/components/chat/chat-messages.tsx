
'use client';

import { Card, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Phone, Video, MoreVertical, LogOut } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatInput } from './chat-input';
import { Contact, Message } from '@/types/chat';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '../ui/tooltip';
import { ReadIndicator } from './read-indicator';

interface ChatMessagesProps {
  messages: Message[];
  selectedContact: Contact;
  onExitChat?: () => void;
  isFullScreen?: boolean;
}

export function ChatMessages({ messages, selectedContact, onExitChat, isFullScreen = false }: ChatMessagesProps) {
  const userAvatar = PlaceHolderImages.find((img) => img.id === 'user-avatar');
  const contactAvatar = PlaceHolderImages.find((img) => img.id === selectedContact.id);

  return (
    <Card className="h-full flex flex-col rounded-none border-none">
      <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          {isFullScreen && (
             <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={onExitChat}>
                            <LogOut className="h-5 w-5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Exit Chat</TooltipContent>
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
          <Button variant="outline" size="icon">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex items-end gap-2',
                message.senderId === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.senderId !== 'user' && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={contactAvatar?.imageUrl} alt={selectedContact.name} data-ai-hint={contactAvatar?.imageHint} />
                  <AvatarFallback>{selectedContact.name.slice(0, 2)}</AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  'max-w-[70%] rounded-lg p-3 text-sm',
                  message.senderId === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-none'
                    : 'bg-muted rounded-bl-none'
                )}
              >
                <p>{message.content}</p>
                 <div className={cn("text-xs mt-1 flex items-center justify-end gap-1", message.senderId === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground/70' )}>
                    <span>{message.timestamp}</span>
                    {message.senderId === 'user' && <ReadIndicator status={message.readStatus} />}
                </div>
              </div>
              {message.senderId === 'user' && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={userAvatar?.imageUrl} alt="You" data-ai-hint={userAvatar?.imageHint} />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="p-4 border-t">
        <ChatInput />
      </div>
    </Card>
  );
}
