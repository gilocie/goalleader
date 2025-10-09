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
      <DialogContent className="sm:max-w-sm p-0">
        <DialogHeader className="items-center text-center pt-8 pb-4">
          <div className="relative">
            <Avatar className="h-24 w-24">
                <AvatarImage src={avatar?.imageUrl} alt={member.name} data-ai-hint={avatar?.imageHint} />
                <AvatarFallback className="text-3xl">{member.name.split(' ').map((n) => n[0]).join('')}</AvatarFallback>
            </Avatar>
             <div className={cn(
                'absolute bottom-1 right-1 block h-3.5 w-3.5 rounded-full border-2 border-background',
                member.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
             )} />
          </div>
          <DialogTitle className="text-2xl pt-4">{member.name}</DialogTitle>
          <DialogDescription>{member.role}</DialogDescription>
        </DialogHeader>
        <div className="px-6 space-y-4">
            <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">Department</span>
                <Badge variant="secondary">{member.department}</Badge>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">Branch</span>
                <span className="text-sm font-semibold">Main Office</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">Country</span>
                <span className="text-sm font-semibold">Malawi</span>
            </div>
            <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Bio</p>
                <p className="text-sm bg-muted p-3 rounded-md">A passionate developer dedicated to building beautiful and functional user experiences.</p>
            </div>
        </div>
        <DialogFooter className="p-6">
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
