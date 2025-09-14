
'use client';

import { Card, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { Contact } from '@/types/chat';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface ChatContactListProps {
  contacts: Contact[];
  onSelectContact: (contact: Contact) => void;
}

export function ChatContactList({ contacts, onSelectContact }: ChatContactListProps) {
  return (
    <Card className="h-full flex flex-col rounded-none border-none">
      <CardHeader className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search..." className="w-full pl-8" />
        </div>
      </CardHeader>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {contacts.map((contact) => {
            const avatar = PlaceHolderImages.find((img) => img.id === contact.id);
            return (
              <Card
                key={contact.id}
                className={cn(
                  'cursor-pointer transition-all hover:shadow-lg shadow-md'
                )}
                onClick={() => onSelectContact(contact)}
              >
                <div className="flex items-center gap-3 p-3">
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
                    <p className="font-semibold text-sm">{contact.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{contact.lastMessage}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">{contact.lastMessageTime}</div>
                </div>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </Card>
  );
}
