
'use client';

import React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { Contact } from '@/types/chat';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ReadIndicator } from './read-indicator';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { useSidebar } from '../layout/sidebar';

interface ChatContactListProps {
  contacts: Contact[];
  onSelectContact: (contact: Contact) => void;
  selectedContactId?: string | null;
}

export function ChatContactList({ contacts, onSelectContact, selectedContactId }: ChatContactListProps) {
  const { open: isSidebarOpen } = useSidebar();
  return (
    <Card className="h-full flex flex-col rounded-none border-none">
      {/* Fixed Header */}
      <CardHeader className={cn("p-4 border-b flex-shrink-0 flex items-center gap-4 justify-between")}>
        <div className="flex items-center gap-4">
          <CardTitle className="text-xl">Chats</CardTitle>
          <div className="relative w-full max-w-[200px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search..." className="w-full pl-8" />
          </div>
        </div>
      </CardHeader>

      {/* Scrollable Contact List */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-2">
            {contacts.map((contact, index) => {
              const avatar = PlaceHolderImages.find((img) => img.id === contact.id);
              const isSelected = selectedContactId === contact.id;
              return (
                <React.Fragment key={contact.id}>
                  <div
                    className={cn(
                      'cursor-pointer transition-all hover:bg-accent/50 rounded-lg p-3 group',
                      isSelected && 'bg-primary text-primary-foreground'
                    )}
                    onClick={() => onSelectContact(contact)}
                  >
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
                            <ReadIndicator status={contact.lastMessageReadStatus} className="h-3.5 w-3.5" isSelf={false}/>
                            <span className={cn("md:text-white", isSelected && 'text-white')}>{contact.lastMessage}</span>
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
                  </div>
                  {index < contacts.length - 1 && <Separator className="my-1" />}
                </React.Fragment>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </Card>
  );
}
