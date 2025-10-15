
'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Plus, Users, Phone, Video, PhoneIncoming, PhoneOutgoing, PhoneMissed, Archive, Download, Trash2, CheckSquare, Square } from 'lucide-react';
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

interface ChatContactListProps {
  contacts: Contact[];
  onSelectContact: (contact: Contact) => void;
  selectedContactId?: string | null;
}

const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

const CallLogItem = ({ 
  message, 
  contact, 
  isSelected, 
  onToggleSelect 
}: { 
  message: Message;
  contact: Contact | undefined;
  isSelected: boolean;
  onToggleSelect: () => void;
}) => {
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
        <Card className={cn("p-3 cursor-pointer transition-all hover:shadow-md", isSelected && "ring-2 ring-primary")}>
            <div className="flex items-center gap-3">
                <div className="cursor-pointer" onClick={onToggleSelect}>
                    {isSelected ? (
                        <CheckSquare className="h-5 w-5 text-primary" />
                    ) : (
                        <Square className="h-5 w-5 text-muted-foreground" />
                    )}
                </div>
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
                    <span>{formatTimeAgo(message.timestamp.toDate())}</span>
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
  const [activeTab, setActiveTab] = useState('chats');
  
  // Selection states for each tab
  const [selectedChats, setSelectedChats] = useState<Set<string>>(new Set());
  const [selectedCalls, setSelectedCalls] = useState<Set<string>>(new Set());
  const [selectedArchive, setSelectedArchive] = useState<Set<string>>(new Set());

  const filteredContacts = useMemo(() => {
    if (!searchTerm) {
      return contacts;
    }
    return contacts.filter(contact =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [contacts, searchTerm]);
  
  const callLogs = useMemo(() => {
    const logs = messages
      .filter(m => m.isSystem)
      .sort((a, b) => (b.timestamp?.toMillis() || 0) - (a.timestamp?.toMillis() || 0));
    
    if (!searchTerm) return logs;
    
    return logs.filter(message => {
      const contactId = message.senderId === self?.id ? message.recipientId : message.senderId;
      const contact = allContacts.find(c => c.id === contactId);
      return contact?.name.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [messages, searchTerm, self, allContacts]);

  // Mock archived chats - in real app, this would come from props/context
  const archivedContacts = useMemo(() => {
    // For demo purposes, return empty array
    const archived: Contact[] = [];
    
    if (!searchTerm) return archived;
    
    return archived.filter(contact =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const handleStartChat = (contact: Contact) => {
    onSelectContact(contact);
    setIsNewChatOpen(false);
  }

  const toggleChatSelection = (chatId: string) => {
    setSelectedChats(prev => {
      const newSet = new Set(prev);
      if (newSet.has(chatId)) {
        newSet.delete(chatId);
      } else {
        newSet.add(chatId);
      }
      return newSet;
    });
  };

  const toggleCallSelection = (callId: string) => {
    setSelectedCalls(prev => {
      const newSet = new Set(prev);
      if (newSet.has(callId)) {
        newSet.delete(callId);
      } else {
        newSet.add(callId);
      }
      return newSet;
    });
  };

  const toggleArchiveSelection = (archiveId: string) => {
    setSelectedArchive(prev => {
      const newSet = new Set(prev);
      if (newSet.has(archiveId)) {
        newSet.delete(archiveId);
      } else {
        newSet.add(archiveId);
      }
      return newSet;
    });
  };

  const exportSelected = () => {
    let dataToExport: any[] = [];
    let filename = '';

    if (activeTab === 'chats') {
      dataToExport = filteredContacts
        .filter(c => selectedChats.has(c.id))
        .map(c => ({
          name: c.name,
          lastMessage: c.lastMessage,
          lastMessageTime: c.lastMessageTime,
          status: c.status
        }));
      filename = 'exported-chats.json';
    } else if (activeTab === 'calls') {
      dataToExport = callLogs
        .filter(m => selectedCalls.has(m.id))
        .map(m => {
          const contactId = m.senderId === self?.id ? m.recipientId : m.senderId;
          const contact = allContacts.find(c => c.id === contactId);
          return {
            contactName: contact?.name,
            type: m.callType,
            content: m.content,
            timestamp: m.timestamp.toDate().toISOString()
          };
        });
      filename = 'exported-calls.json';
    } else if (activeTab === 'archive') {
      dataToExport = archivedContacts
        .filter(c => selectedArchive.has(c.id))
        .map(c => ({
          name: c.name,
          lastMessage: c.lastMessage,
          lastMessageTime: c.lastMessageTime
        }));
      filename = 'exported-archive.json';
    }

    if (dataToExport.length === 0) return;

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const deleteSelected = () => {
    if (activeTab === 'chats') {
      // In real app, would delete selected chats
      console.log('Delete chats:', Array.from(selectedChats));
      setSelectedChats(new Set());
    } else if (activeTab === 'calls') {
      console.log('Delete calls:', Array.from(selectedCalls));
      setSelectedCalls(new Set());
    } else if (activeTab === 'archive') {
      console.log('Delete archive:', Array.from(selectedArchive));
      setSelectedArchive(new Set());
    }
  };

  const getSelectedCount = () => {
    if (activeTab === 'chats') return selectedChats.size;
    if (activeTab === 'calls') return selectedCalls.size;
    if (activeTab === 'archive') return selectedArchive.size;
    return 0;
  };

  const hasSelection = getSelectedCount() > 0;

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
        
        {/* Action Bar */}
        {hasSelection && (
          <div className="flex items-center gap-2 mt-3 p-2 bg-muted rounded-md">
            <span className="text-sm font-medium flex-1">
              {getSelectedCount()} selected
            </span>
            <Button variant="outline" size="sm" onClick={exportSelected}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
            <Button variant="destructive" size="sm" onClick={deleteSelected}>
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        )}
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
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
                      const isMarked = selectedChats.has(contact.id);
                      const isLastMessageFromSelf = contact.lastMessageSenderId === self?.id;
                      
                      const isRequest = isLastMessageFromSelf && contact.lastMessageReadStatus === 'request_sent';

                      return (
                          <Card
                              key={contact.id}
                              className={cn(
                              'cursor-pointer transition-all hover:shadow-md',
                              isSelected && 'bg-primary text-primary-foreground',
                              isMarked && 'ring-2 ring-primary'
                              )}
                          >
                              <CardContent className="p-3">
                                  <div className="flex items-center gap-3">
                                  <div className="cursor-pointer" onClick={(e) => {
                                    e.stopPropagation();
                                    toggleChatSelection(contact.id);
                                  }}>
                                    {isMarked ? (
                                      <CheckSquare className={cn("h-5 w-5", isSelected ? "text-primary-foreground" : "text-primary")} />
                                    ) : (
                                      <Square className={cn("h-5 w-5", isSelected ? "text-primary-foreground/70" : "text-muted-foreground")} />
                                    )}
                                  </div>
                                  <div className="relative" onClick={() => onSelectContact(contact)}>
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
                                  <div className="flex-1 truncate" onClick={() => onSelectContact(contact)}>
                                      <p className={cn("font-semibold text-sm", isSelected && 'text-white')}>{contact.name}</p>
                                      <div className={cn("flex items-center gap-1 text-xs truncate", isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
                                          {isLastMessageFromSelf && !isRequest && <ReadIndicator status={contact.lastMessageReadStatus} className="h-3.5 w-3.5" isSelf={isLastMessageFromSelf}/>}
                                          <span className={cn("truncate", isSelected && 'text-white', isRequest && 'italic')}>
                                              {contact.lastMessage ? (isRequest ? 'Message request sent' : contact.lastMessage) : 'Start the conversation!'}
                                          </span>
                                      </div>
                                  </div>
                                  <div className={cn("flex flex-col items-end text-xs space-y-1", isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground')} onClick={() => onSelectContact(contact)}>
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
                const isMarked = selectedCalls.has(message.id);
                return (
                  <CallLogItem 
                    key={message.id} 
                    message={message} 
                    contact={contact}
                    isSelected={isMarked}
                    onToggleSelect={() => toggleCallSelection(message.id)}
                  />
                );
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
          <ScrollArea className="h-full">
            {archivedContacts.length > 0 ? (
              <div className="p-2 space-y-2">
                {archivedContacts.map((contact) => {
                  const avatar = PlaceHolderImages.find((img) => img.id === contact.id);
                  const isMarked = selectedArchive.has(contact.id);

                  return (
                    <Card
                      key={contact.id}
                      className={cn(
                        'cursor-pointer transition-all hover:shadow-md',
                        isMarked && 'ring-2 ring-primary'
                      )}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="cursor-pointer" onClick={() => toggleArchiveSelection(contact.id)}>
                            {isMarked ? (
                              <CheckSquare className="h-5 w-5 text-primary" />
                            ) : (
                              <Square className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={avatar?.imageUrl} alt={contact.name} />
                            <AvatarFallback>{contact.name.slice(0, 2)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 truncate">
                            <p className="font-semibold text-sm">{contact.name}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {contact.lastMessage || 'No messages'}
                            </p>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {contact.lastMessageTime}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-3">
                <Archive className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="text-xl font-semibold">Archived Chats</h3>
                <p className="text-muted-foreground max-w-xs">
                  Your archived conversations will appear here.
                </p>
              </div>
            )}
          </ScrollArea>
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

