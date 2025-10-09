
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
import { MultiSelectCombobox } from '@/components/meetings/multi-select-combobox';
import { Label } from '../ui/label';

interface Member {
    id: string;
    name: string;
    department: string;
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
  
  const memberOptions = allMembers.map(member => ({
    value: member.id,
    label: member.name
  }));

  const handleCreate = () => {
    onTeamCreate(selectedMembers);
  };

  const handleDialogChange = (open: boolean) => {
    if (!open) {
        setSelectedMembers([]);
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Create New Team</DialogTitle>
          <DialogDescription>
            Select members from your department ({department}) to form a new team.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
            <Label>Team Members</Label>
            <MultiSelectCombobox
                options={memberOptions}
                selected={selectedMembers}
                onChange={setSelectedMembers}
                placeholder="Select team members..."
            />
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

