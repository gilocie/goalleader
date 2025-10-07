
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
import { ScrollArea } from '../ui/scroll-area';
import { clientLeadsForCombobox } from '@/lib/client-leads';
import type { Suggestion } from '@/types/marketing';
import { useToast } from '@/hooks/use-toast';
import { Send } from 'lucide-react';

interface SendContentDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  selectedContent: Suggestion[];
}

export function SendContentDialog({
  isOpen,
  onOpenChange,
  selectedContent,
}: SendContentDialogProps) {
  const [recipients, setRecipients] = useState<string[]>([]);
  const { toast } = useToast();

  const handleSend = () => {
    // In a real app, this would trigger an email or other notification service.
    console.log({
      content: selectedContent.map(c => c.blogTitle),
      recipients: recipients,
    });
    toast({
        title: "Content Sent!",
        description: `Your selected marketing materials have been sent to ${recipients.length} client(s).`,
    });
    onOpenChange(false);
  };
  
  const handleDialogChange = (open: boolean) => {
    if (!open) {
        setRecipients([]);
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle>Send Marketing Content</DialogTitle>
          <DialogDescription>
            Choose the clients you want to send the selected content to.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 space-y-4">
            <div className="space-y-2">
                <Label>Selected Content</Label>
                <ScrollArea className="h-24 rounded-md border p-2">
                    <ul className="list-disc pl-5 text-sm text-muted-foreground">
                        {selectedContent.map(c => <li key={c.blogTitle}>{c.blogTitle}</li>)}
                    </ul>
                </ScrollArea>
            </div>
            <div className="space-y-2">
                <Label>Recipients</Label>
                <MultiSelectCombobox 
                    options={clientLeadsForCombobox}
                    selected={recipients}
                    onChange={setRecipients}
                    placeholder="Select clients..."
                />
            </div>
        </div>
        
        <DialogFooter className="p-6 pt-4 border-t mt-auto">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={handleSend}
            disabled={recipients.length === 0}
          >
            <Send className="mr-2 h-4 w-4" />
            Send to {recipients.length} client(s)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
