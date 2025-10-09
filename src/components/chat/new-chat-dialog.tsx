
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
import { Search, LayoutGrid, List, User } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { Contact } from '@/types/chat';
import { useUser } from '@/context/user-context';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { allTeamMembers } from '@/lib/users';

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
  const { user: self } = useUser();
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');

  const membersToShow = allTeamMembers.filter(member => member.id !== self?.id);

  const filteredMembers = membersToShow.filter(member =>
    member.name.toLowerCase().replace(' (you)', '').includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl h-[570px] flex flex-col p-0">
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
                    layout === 'list' ? 'space-y-1' : 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
                )}>
                {filteredMembers.map(member => {
                    const avatar = PlaceHolderImages.find(p => p.id === member.id);
                    const memberName = member.name.replace(' (You)', '');
                    
                    const contact: Contact = {
                        id: member.id,
                        name: memberName,
                        role: member.role,
                        status: member.status,
                        lastMessage: '',
                        lastMessageTime: '',
                    };

                    if (layout === 'grid') {
                        return (
                             <Card
                                key={member.id}
                                className="flex flex-col items-center text-center p-3 pt-10 cursor-pointer hover:bg-muted relative"
                                onClick={() => onStartChat(contact)}
                            >
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 absolute top-2 left-2 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        console.log(`View profile of ${member.name}`);
                                    }}
                                >
                                    <User className="h-4 w-4" />
                                </Button>
                                 <div className={cn(
                                    'absolute top-3 right-3 h-2.5 w-2.5 rounded-full border-2 border-background',
                                    member.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                                  )} />
                                
                                <Avatar className="h-12 w-12 mb-2">
                                    <AvatarImage src={avatar?.imageUrl} alt={memberName} data-ai-hint={avatar?.imageHint}/>
                                    <AvatarFallback>{memberName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <p className="text-sm font-semibold line-clamp-1">{memberName}</p>
                                <p className="text-xs text-muted-foreground line-clamp-1">{member.role}</p>
                            </Card>
                        )
                    }
                    return (
                        <div
                            key={member.id}
                            className="flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-muted"
                            onClick={() => onStartChat(contact)}
                        >
                            <div className="relative">
                              <Avatar>
                                  <AvatarImage src={avatar?.imageUrl} alt={memberName} data-ai-hint={avatar?.imageHint}/>
                                  <AvatarFallback>{memberName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                               <div className={cn(
                                  'absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full border-2 border-background',
                                  member.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                                )} />
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold">{memberName}</p>
                                <p className="text-sm text-muted-foreground">{member.role}</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    console.log(`View profile of ${member.name}`);
                                }}
                            >
                                <User className="h-4 w-4 text-muted-foreground" />
                            </Button>
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
