
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '../ui/label';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Check } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { Card } from '../ui/card';

interface Member {
    id: string;
    name: string;
    department: string;
    role: string;
}

interface CreateTeamDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  allMembers: Member[];
  onTeamCreate: (selectedMemberIds: string[]) => void;
  department: string;
}

export function CreateTeamDialog({
  isOpen,
  onOpenChange,
  allMembers,
  onTeamCreate,
  department,
}: CreateTeamDialogProps) {
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  
  const handleCreate = () => {
    onTeamCreate(selectedMembers);
  };

  const handleDialogChange = (open: boolean) => {
    if (!open) {
        setSelectedMembers([]);
    }
    onOpenChange(open);
  }

  const toggleMemberSelection = (memberId: string) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-3xl flex flex-col h-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Team</DialogTitle>
          <DialogDescription>
            Select members from your department ({department}) to form a new team.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden -mx-6 px-6">
            <ScrollArea className="h-full">
                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 py-4">
                    {allMembers.map(member => {
                        const avatar = PlaceHolderImages.find(p => p.id === member.id);
                        const isSelected = selectedMembers.includes(member.id);
                        return (
                            <Card 
                                key={member.id} 
                                className={cn(
                                    "p-3 flex flex-col items-center justify-center text-center cursor-pointer transition-all border-2",
                                    isSelected ? "border-primary bg-primary/5" : "hover:bg-muted"
                                )}
                                onClick={() => toggleMemberSelection(member.id)}
                            >
                                <div className="relative">
                                    <Avatar className="h-16 w-16 mb-2">
                                        <AvatarImage src={avatar?.imageUrl} alt={member.name} data-ai-hint={avatar?.imageHint} />
                                        <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                    </Avatar>
                                    {isSelected && (
                                        <div className="absolute top-0 right-0 h-5 w-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                                            <Check className="h-3 w-3" />
                                        </div>
                                    )}
                                </div>
                                <p className="text-sm font-semibold line-clamp-2">{member.name}</p>
                                <p className="text-xs text-muted-foreground">{member.role}</p>
                            </Card>
                        )
                    })}
                 </div>
            </ScrollArea>
        </div>
        
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={handleCreate}
            disabled={selectedMembers.length === 0}
          >
            Create Team
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
