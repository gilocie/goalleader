
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
import { Input } from '@/components/ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Check, Search } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { Card } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { allTeamMembers } from '@/lib/users';
import { useUser } from '@/context/user-context';

interface SwitchProfileDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSwitchProfile: (selectedMemberId: string) => void;
}

const allDepartments = [...new Set(allTeamMembers.map(m => m.department))];


export function SwitchProfileDialog({
  isOpen,
  onOpenChange,
  onSwitchProfile,
}: SwitchProfileDialogProps) {
  const { user: currentUser } = useUser();
  const [selectedMember, setSelectedMember] = useState<string | null>(currentUser.id);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  
  const handleSwitch = () => {
    if (selectedMember) {
      onSwitchProfile(selectedMember);
    }
  };

  const handleDialogChange = (open: boolean) => {
    if (!open) {
        setSelectedMember(currentUser.id);
        setSearchTerm('');
        setDepartmentFilter('all');
    }
    onOpenChange(open);
  }

  const filteredMembers = allTeamMembers.filter(member => {
    const nameMatch = member.name.toLowerCase().includes(searchTerm.toLowerCase());
    const departmentMatch = departmentFilter === 'all' || member.department === departmentFilter;
    return nameMatch && departmentMatch;
  });

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-3xl flex flex-col h-[600px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Switch Profile</DialogTitle>
          <DialogDescription>
            Select a profile to act as. This will reload the application with their permissions.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Search for a team member..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Filter by Department" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {allDepartments.map(dept => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>


        <div className="flex-1 overflow-hidden -mx-6 px-6">
            <ScrollArea className="h-full">
                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 py-4">
                    {filteredMembers.map(member => {
                        const avatar = PlaceHolderImages.find(p => p.id === member.id);
                        const isSelected = selectedMember === member.id;
                        return (
                            <Card 
                                key={member.id} 
                                className={cn(
                                    "p-3 flex flex-col items-center justify-center text-center cursor-pointer transition-all border-2",
                                    isSelected ? "border-primary bg-primary/5" : "hover:bg-muted"
                                )}
                                onClick={() => setSelectedMember(member.id)}
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
                 {filteredMembers.length === 0 && (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        No members found.
                    </div>
                 )}
            </ScrollArea>
        </div>
        
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={handleSwitch}
            disabled={!selectedMember || selectedMember === currentUser.id}
          >
            Switch Profile
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
