
'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Plus, Users, Phone, Video, PhoneIncoming, PhoneOutgoing, PhoneMissed, Archive } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { Contact, Message } from '@/types/chat';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ReadIndicator } from './read-indicator';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { useSidebar } from '../layout/sidebar';
import { NewChatDialog } from './new-chat-dialog';
import { Button } from '../ui/button';
import { useChat } from '@/context/chat-context';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { format, formatDistanceToNow } from 'date-fns';

interface ChatContactListProps {
  contacts: Contact[];
  onSelectContact: (contact: Contact) => void;
  selectedContactId?: string | null;
}

const CallLogItem = ({ message, contact }: { message: Message, contact: Contact | undefined }) => {
    if (!contact) return null;

    const isOutgoing = message.content.startsWith('Calling') || message.content.startsWith('Voice call with');
    const isMissed = message.content.startsWith('Missed');
    const isIncoming = !isOutgoing && !isMissed;
    const isVideo = message.callType === 'video';

    const getStatusIcon = () => {
        if (isOutgoing) return <PhoneOutgoing className="h-4 w-4 text-blue-500" />;
        if (isMissed) return <PhoneMissed className="h-4 w-4 text-destructive" />;
        return <PhoneIncoming className="h-4 w-4 text-green-500" />;
    };

    return (
        <Card className="p-3">
            <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={PlaceHolderImages.find(p => p.id === contact.id)?.imageUrl} alt={contact.name} />
                    <AvatarFallback>{contact.name.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 truncate">
                    <p className="font-semibold text-sm">{contact.name}</p>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        {getStatusIcon()}
                        <span>{isOutgoing ? 'Outgoing' : isMissed ? 'Missed' : 'Incoming'}</span>
                    </div>
                </div>
                <div className="flex flex-col items-end text-xs text-muted-foreground">
                    {isVideo ? <Video className="h-4 w-4 mb-1" /> : <Phone className="h-4 w-4 mb-1" />}
                    <span>{formatDistanceToNow(message.timestamp.toDate(), { addSuffix: true })}</span>
                </div>
            </div>
        </Card>
    )
}

export function ChatContactList({ contacts, onSelectContact, selectedContactId }: ChatContactListProps) {
  const { open: isSidebarOpen } = useSidebar();
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const { allContacts, self, messages } = useChat();

  const filteredContacts = useMemo(() => {
    if (!searchTerm) {
      return contacts;
    }
    return contacts.filter(contact =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [contacts, searchTerm]);
  
  const callLogs = useMemo(() => {
    return messages
      .filter(m => m.isSystem)
      .sort((a, b) => (b.timestamp?.toMillis() || 0) - (a.timestamp?.toMillis() || 0));
  }, [messages]);

  const handleStartChat = (contact: Contact) => {
    onSelectContact(contact);
    setIsNewChatOpen(false);
  }

  return (
    <>
    <Card className="h-full flex flex-col rounded-none border-none">
      {/* Fixed Header */}
      <CardHeader className={cn("p-4 border-b flex-shrink-0", !isSidebarOpen ? "pl-8" : "pl-8")}>
        <div className="flex items-center gap-4">
          <CardTitle className="text-xl">Chats</CardTitle>
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search..." 
              className="w-full pl-8" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="default" size="icon" onClick={() => setIsNewChatOpen(true)} className="h-9 w-9 bg-primary text-primary-foreground hover:bg-primary/90">
                  <Plus className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Start new chat</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      
      <Tabs defaultValue="chats" className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 pt-2 border-b">
          <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="chats">Chats</TabsTrigger>
              <TabsTrigger value="calls">Calls</TabsTrigger>
              <TabsTrigger value="archive">Archive</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="chats" className="flex-1 overflow-hidden mt-0">
          <ScrollArea className="h-full">
              {filteredContacts.length > 0 ? (
                  <div className="p-2 space-y-2">
                      {filteredContacts.map((contact) => {
                      const avatar = PlaceHolderImages.find((img) => img.id === contact.id);
                      const isSelected = selectedContactId === contact.id;
                      const isLastMessageFromSelf = contact.lastMessageSenderId === self?.id;
                      
                      const isRequest = isLastMessageFromSelf && contact.lastMessageReadStatus === 'request_sent';

                      return (
                          <Card
                              key={contact.id}
                              className={cn(
                              'cursor-pointer transition-all hover:shadow-md',
                              isSelected && 'bg-primary text-primary-foreground'
                              )}
                              onClick={() => onSelectContact(contact)}
                          >
                              <CardContent className="p-3">
                                  <div className="flex items-center gap-3">
                                  <div className="relative">
                                      <Avatar className="h-10 w-10">
                                      <AvatarImage src={avatar?.imageUrl} alt={contact.name} data-ai-hint={avatar?.imageHint} />
                                      <AvatarFallback>{contact.name.slice(0, 2)}</AvatarFallback>
                                      </Avatar>
                                      <span
                                      className={cn(
                                          'absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full border-2 border-background',
                                          contact.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                                      )}
                                      />
                                  </div>
                                  <div className="flex-1 truncate">
                                      <p className={cn("font-semibold text-sm", isSelected && 'text-white')}>{contact.name}</p>
                                      <div className={cn("flex items-center gap-1 text-xs truncate", isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
                                          {isLastMessageFromSelf && !isRequest && <ReadIndicator status={contact.lastMessageReadStatus} className="h-3.5 w-3.5" isSelf={isLastMessageFromSelf}/>}
                                          <span className={cn("truncate", isSelected && 'text-white', isRequest && 'italic')}>
                                              {contact.lastMessage ? (isRequest ? 'Message request sent' : contact.lastMessage) : 'Start the conversation!'}
                                          </span>
                                      </div>
                                  </div>
                                  <div className={cn("flex flex-col items-end text-xs space-y-1", isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
                                      <span className={cn(isSelected && 'text-white')}>{contact.lastMessageTime}</span>
                                      {contact.unreadCount && contact.unreadCount > 0 && (
                                          <Badge className={cn(
                                              "h-5 w-5 p-0 flex items-center justify-center",
                                              isSelected ? 'bg-primary-foreground text-primary' : 'bg-primary text-primary-foreground'
                                          )}>
                                              {contact.unreadCount}
                                          </Badge>
                                      )}
                                  </div>
                                  </div>
                              </CardContent>
                          </Card>
                      );
                      })}
                  </div>
              ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-3">
                      <h3 className="text-xl font-semibold">No active chats</h3>
                      <p className="text-muted-foreground max-w-xs">
                          You don't have any conversations yet. Start one by finding a friend.
                      </p>
                      <Button onClick={() => setIsNewChatOpen(true)}>
                          <Users className="mr-2 h-4 w-4" />
                          Find a Friend
                      </Button>
                  </div>
              )}
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="calls" className="flex-1 overflow-hidden mt-0">
          <ScrollArea className="h-full">
            <div className="p-2 space-y-2">
              {callLogs.map(message => {
                const contactId = message.senderId === self?.id ? message.recipientId : message.senderId;
                const contact = allContacts.find(c => c.id === contactId);
                return <CallLogItem key={message.id} message={message} contact={contact} />;
              })}
               {callLogs.length === 0 && (
                 <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-3">
                    <Phone className="h-12 w-12 text-muted-foreground/50" />
                    <h3 className="text-xl font-semibold">No Call History</h3>
                    <p className="text-muted-foreground max-w-xs">Your recent calls will appear here.</p>
                </div>
               )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="archive" className="flex-1 overflow-hidden mt-0">
          <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-3">
            <Archive className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="text-xl font-semibold">Archived Chats</h3>
            <p className="text-muted-foreground max-w-xs">
                Your archived conversations will appear here.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
    <NewChatDialog 
        isOpen={isNewChatOpen}
        onOpenChange={setIsNewChatOpen}
        onStartChat={handleStartChat}
    />
    </>
  );
}
