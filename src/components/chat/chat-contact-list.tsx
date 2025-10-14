
'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Plus, Users, Phone, Video, PhoneIncoming, PhoneOutgoing, PhoneMissed, Archive, Trash2, CheckSquare, Download, MoreHorizontal } from 'lucide-react';
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
import { Checkbox } from '../ui/checkbox';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel } from '../ui/dropdown-menu';

interface ChatContactListProps {
  contacts: Contact[];
  onSelectContact: (contact: Contact) => void;
  selectedContactId?: string | null;
}

const ActionToolbar = ({ selectedCount, onSelectAll, allSelected, onDelete, onExport, showExport = false }: { selectedCount: number, onSelectAll: (checked: boolean) => void, allSelected: boolean, onDelete: () => void, onExport?: () => void, showExport?: boolean }) => {
    if (selectedCount === 0) return null;

    return (
        <div className="flex items-center justify-between p-2 mb-2 border rounded-lg bg-muted/50 sticky top-0 z-10">
            <div className="flex items-center gap-2">
                <Checkbox id="selectAll" checked={allSelected} onCheckedChange={(checked) => onSelectAll(!!checked)} />
                <label htmlFor="selectAll" className="text-sm font-medium">{selectedCount} selected</label>
            </div>
            <div className="flex items-center gap-2">
                {showExport && onExport && (
                    <Button variant="outline" size="sm" onClick={onExport}>
                        <Download className="mr-2 h-4 w-4" /> Export
                    </Button>
                )}
                <Button variant="destructive" size="sm" onClick={onDelete}>
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
            </div>
        </div>
    );
};


const CallLogItem = ({ message, contact, onSelect, isSelected }: { message: Message, contact: Contact | undefined, onSelect: (id: string, checked: boolean) => void, isSelected: boolean }) => {
    if (!contact) return null;

    const isOutgoing = message.content.startsWith('Calling') || message.content.startsWith('Voice call with');
    const isMissed = message.content.startsWith('Missed');

    const getStatusIcon = () => {
        if (isOutgoing) return <PhoneOutgoing className="h-4 w-4 text-blue-500" />;
        if (isMissed) return <PhoneMissed className="h-4 w-4 text-destructive" />;
        return <PhoneIncoming className="h-4 w-4 text-green-500" />;
    };

    return (
        <div className="flex items-center gap-3">
             <Checkbox 
                checked={isSelected}
                onCheckedChange={(checked) => onSelect(message.id, !!checked)}
                className="flex-shrink-0"
                onClick={(e) => e.stopPropagation()}
            />
            <Card className="p-3 flex-1 relative">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-7 w-7">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

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
                        {message.callType === 'video' ? <Video className="h-4 w-4 mb-1" /> : <Phone className="h-4 w-4 mb-1" />}
                        <span>{formatDistanceToNow(message.timestamp.toDate(), { addSuffix: true })}</span>
                    </div>
                </div>
            </Card>
        </div>
    )
}

export function ChatContactList({ contacts, onSelectContact, selectedContactId }: ChatContactListProps) {
  const { open: isSidebarOpen } = useSidebar();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('chats');
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const { allContacts, self, messages, clearChat, deleteChat } = useChat();

  const [selectedChats, setSelectedChats] = useState<string[]>([]);
  const [selectedCalls, setSelectedCalls] = useState<string[]>([]);

  const filteredContacts = useMemo(() => {
    if (activeTab !== 'chats' || !searchTerm) return contacts;
    return contacts.filter(contact =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [contacts, searchTerm, activeTab]);
  
  const callLogs = useMemo(() => {
    return messages
      .filter(m => m.isSystem)
      .sort((a, b) => (b.timestamp?.toMillis() || 0) - (a.timestamp?.toMillis() || 0));
  }, [messages]);

  const filteredCallLogs = useMemo(() => {
      if (activeTab !== 'calls' || !searchTerm) return callLogs;
      return callLogs.filter(log => {
        const contactId = log.senderId === self?.id ? log.recipientId : log.senderId;
        const contact = allContacts.find(c => c.id === contactId);
        return contact?.name.toLowerCase().includes(searchTerm.toLowerCase());
      })
  }, [callLogs, searchTerm, allContacts, self, activeTab]);

  const handleStartChat = (contact: Contact) => {
    onSelectContact(contact);
    setIsNewChatOpen(false);
  }
  
  const handleChatSelect = (id: string, checked: boolean) => {
    setSelectedChats(prev => checked ? [...prev, id] : prev.filter(item => item !== id));
  };
  
  const handleCallSelect = (id: string, checked: boolean) => {
    setSelectedCalls(prev => checked ? [...prev, id] : prev.filter(item => item !== id));
  };

  const handleSelectAll = (checked: boolean, type: 'chats' | 'calls') => {
    if (type === 'chats') {
        setSelectedChats(checked ? filteredContacts.map(c => c.id) : []);
    } else {
        setSelectedCalls(checked ? filteredCallLogs.map(c => c.id) : []);
    }
  };

  const handleDeleteSelected = (type: 'chats' | 'calls') => {
      if (type === 'chats') {
          selectedChats.forEach(id => deleteChat(id));
          setSelectedChats([]);
      } else {
          // This would need a `deleteMessages` function in the context
          console.log("Deleting calls not implemented yet", selectedCalls);
          setSelectedCalls([]);
      }
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
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 pt-2 border-b">
          <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="chats">Chats</TabsTrigger>
              <TabsTrigger value="calls">Calls</TabsTrigger>
              <TabsTrigger value="archive">Archive</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="chats" className="flex-1 flex flex-col overflow-hidden mt-0">
            <ScrollArea className="h-full p-2 space-y-2">
                <ActionToolbar 
                    selectedCount={selectedChats.length}
                    allSelected={selectedChats.length > 0 && selectedChats.length === filteredContacts.length}
                    onSelectAll={(checked) => handleSelectAll(checked, 'chats')}
                    onDelete={() => handleDeleteSelected('chats')}
                />
                {filteredContacts.length > 0 ? (
                    filteredContacts.map((contact) => {
                    const avatar = PlaceHolderImages.find((img) => img.id === contact.id);
                    const isSelected = selectedContactId === contact.id;
                    const isLastMessageFromSelf = contact.lastMessageSenderId === self?.id;
                    
                    return (
                        <div key={contact.id} className="flex items-center gap-3">
                           <Checkbox
                                id={`select-chat-${contact.id}`}
                                checked={selectedChats.includes(contact.id)}
                                onCheckedChange={(checked) => handleChatSelect(contact.id, !!checked)}
                                onClick={(e) => e.stopPropagation()}
                            />
                            <Card
                                className={cn(
                                'flex-1 cursor-pointer transition-all hover:shadow-md relative',
                                isSelected && 'bg-primary text-primary-foreground'
                                )}
                                onClick={() => onSelectContact(contact)}
                            >
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-7 w-7">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); deleteChat(contact.id); }}>
                                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <CardContent className="p-3">
                                    <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <Avatar className="h-10 w-10">
                                        <AvatarImage src={avatar?.imageUrl} alt={contact.name} data-ai-hint={avatar?.imageHint} />
                                        <AvatarFallback>{contact.name.slice(0, 2)}</AvatarFallback>
                                        </Avatar>
                                        <span className={cn('absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full border-2 border-background', contact.status === 'online' ? 'bg-green-500' : 'bg-gray-400')} />
                                    </div>
                                    <div className="flex-1 truncate">
                                        <p className={cn("font-semibold text-sm", isSelected && 'text-white')}>{contact.name}</p>
                                        <div className={cn("flex items-center gap-1 text-xs truncate", isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
                                            {isLastMessageFromSelf && <ReadIndicator status={contact.lastMessageReadStatus} className="h-3.5 w-3.5" isSelf={isLastMessageFromSelf}/>}
                                            <span className={cn("truncate", isSelected && 'text-white')}>{contact.lastMessage || 'Start the conversation!'}</span>
                                        </div>
                                    </div>
                                    <div className={cn("flex flex-col items-end text-xs space-y-1", isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
                                        <span className={cn(isSelected && 'text-white')}>{contact.lastMessageTime}</span>
                                        {contact.unreadCount && contact.unreadCount > 0 && (
                                            <Badge className={cn("h-5 w-5 p-0 flex items-center justify-center", isSelected ? 'bg-primary-foreground text-primary' : 'bg-primary text-primary-foreground')}>
                                                {contact.unreadCount}
                                            </Badge>
                                        )}
                                    </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    );
                    })
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
        
        <TabsContent value="calls" className="flex-1 flex flex-col overflow-hidden mt-0">
            <ScrollArea className="h-full p-2 space-y-2">
                <ActionToolbar 
                    selectedCount={selectedCalls.length}
                    allSelected={selectedCalls.length > 0 && selectedCalls.length === filteredCallLogs.length}
                    onSelectAll={(checked) => handleSelectAll(checked, 'calls')}
                    onDelete={() => handleDeleteSelected('calls')}
                />
                {filteredCallLogs.map(message => {
                    const contactId = message.senderId === self?.id ? message.recipientId : message.senderId;
                    const contact = allContacts.find(c => c.id === contactId);
                    return <CallLogItem key={message.id} message={message} contact={contact} onSelect={handleCallSelect} isSelected={selectedCalls.includes(message.id)} />;
                })}
                {filteredCallLogs.length === 0 && (
                    <div className="flex items-center justify-center pt-2 pb-4">
                        <div className="text-center space-y-1">
                            <Phone className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">No call history yet</p>
                        </div>
                    </div>
                )}
            </ScrollArea>
        </TabsContent>

        <TabsContent value="archive" className="flex-1 overflow-hidden mt-0">
          <div className="flex items-center justify-center pt-2 pb-4">
            <div className="text-center space-y-1">
              <Archive className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No archived chats</p>
            </div>
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

    