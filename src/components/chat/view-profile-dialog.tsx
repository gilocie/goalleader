
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { TeamMember } from '@/lib/users';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';

interface ViewProfileDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  member: TeamMember | null;
}

export function ViewProfileDialog({ isOpen, onOpenChange, member }: ViewProfileDialogProps) {
  if (!member) {
    return null;
  }

  const avatar = PlaceHolderImages.find((p) => p.id === member.id);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader className="items-center text-center">
          <div className="relative">
            <Avatar className="h-20 w-20">
                <AvatarImage src={avatar?.imageUrl} alt={member.name} data-ai-hint={avatar?.imageHint} />
                <AvatarFallback className="text-2xl">{member.name.split(' ').map((n) => n[0]).join('')}</AvatarFallback>
            </Avatar>
             <div className={cn(
                'absolute bottom-0 right-0 block h-3 w-3 rounded-full border-2 border-background',
                member.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
             )} />
          </div>
          <DialogTitle className="text-xl pt-2">{member.name}</DialogTitle>
          <DialogDescription>{member.role}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">Department</span>
                <Badge variant="secondary">{member.department}</Badge>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">Branch</span>
                <span className="text-sm">Main Office</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">Country</span>
                <span className="text-sm">Malawi</span>
            </div>
            <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Bio</p>
                <p className="text-sm bg-muted p-2 rounded-md">A passionate developer dedicated to building beautiful and functional user experiences.</p>
            </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" className="w-full">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
