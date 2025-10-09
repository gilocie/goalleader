

'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, LayoutGrid, List } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { Contact } from '@/types/chat';
import { useChat } from '@/context/chat-context';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

interface NewChatDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onStartChat: (contact: Contact) => void;
}

export function NewChatDialog({
  isOpen,
  onOpenChange,
  onStartChat,
}: NewChatDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const { allContacts, self } = useChat();
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');

  const membersToShow = allContacts.filter(member => member.id !== self?.id);

  const filteredMembers = membersToShow.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl h-[470px] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <div>
                <DialogTitle>New Chat</DialogTitle>
                <DialogDescription>
                    Select a team member to start a conversation.
                </DialogDescription>
            </div>
             <div className="flex items-center gap-2">
                <Button variant={layout === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setLayout('grid')} className="h-8 w-8">
                    <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button variant={layout === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setLayout('list')} className="h-8 w-8">
                    <List className="h-4 w-4" />
                </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 pb-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search for a team member..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
                <div className={cn(
                    "px-6 py-2",
                    layout === 'list' ? 'space-y-1' : 'grid grid-cols-2 gap-4'
                )}>
                {filteredMembers.map(member => {
                    const avatar = PlaceHolderImages.find(p => p.id === member.id);
                    if (layout === 'grid') {
                        return (
                             <Card
                                key={member.id}
                                className="flex flex-col items-center text-center p-3 cursor-pointer hover:bg-muted"
                                onClick={() => onStartChat(member)}
                            >
                                <Avatar className="h-12 w-12 mb-2">
                                    <AvatarImage src={avatar?.imageUrl} alt={member.name} data-ai-hint={avatar?.imageHint}/>
                                    <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <p className="text-sm font-semibold line-clamp-1">{member.name}</p>
                                <p className="text-xs text-muted-foreground line-clamp-1">{member.role}</p>
                            </Card>
                        )
                    }
                    return (
                        <div
                            key={member.id}
                            className="flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-muted"
                            onClick={() => onStartChat(member)}
                        >
                            <Avatar>
                                <AvatarImage src={avatar?.imageUrl} alt={member.name} data-ai-hint={avatar?.imageHint}/>
                                <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">{member.name}</p>
                                <p className="text-sm text-muted-foreground">{member.role}</p>
                            </div>
                        </div>
                    );
                })}
                 {filteredMembers.length === 0 && (
                    <div className="text-center text-muted-foreground py-8 col-span-full">
                        No members found.
                    </div>
                 )}
                </div>
            </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
