

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
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Search, Check } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { useUser } from '@/context/user-context';
import type { TeamMember } from '@/lib/users';
import { Card } from '../ui/card';

interface SwitchProfileDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSwitchProfile: (member: TeamMember) => void;
}

export function SwitchProfileDialog({
  isOpen,
  onOpenChange,
  onSwitchProfile,
}: SwitchProfileDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const { user: currentUser, allTeamMembers } = useUser();

  const filteredMembers = allTeamMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleDialogChange = (open: boolean) => {
    if (!open) {
        setSearchTerm('');
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-2xl h-[500px] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Switch Profile</DialogTitle>
          <DialogDescription>
            Select a profile to switch to for demonstration purposes.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search by name..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        <div className="flex-1 overflow-hidden -mx-6 px-6">
            <ScrollArea className="h-full">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-4">
                {filteredMembers.map((member) => {
                    const avatar = PlaceHolderImages.find(p => p.id === member.id);
                    const isCurrentUser = currentUser?.id === member.id;
                    return (
                        <Card 
                            key={member.id} 
                            className={cn(
                                "p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all border-2",
                                isCurrentUser ? "border-primary bg-primary/10" : "hover:bg-muted"
                            )}
                            onClick={() => onSwitchProfile(member)}
                        >
                            <div className="relative">
                                <Avatar className="h-20 w-20 mb-2">
                                    <AvatarImage src={avatar?.imageUrl} alt={member.name} data-ai-hint={avatar?.imageHint} />
                                    <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                {isCurrentUser && (
                                     <div className="absolute top-0 right-0 h-6 w-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                                        <Check className="h-4 w-4" />
                                    </div>
                                )}
                            </div>
                            <p className="font-semibold text-sm line-clamp-2">{member.name}</p>
                            <p className="text-xs text-muted-foreground">{member.role}</p>
                        </Card>
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
