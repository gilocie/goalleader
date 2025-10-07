
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Message, Contact } from '@/types/chat';
import { MultiSelectCombobox } from '../meetings/multi-select-combobox';
import { useChat } from '@/context/chat-context';

interface ForwardMessageDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  message: Message;
  contacts: Contact[];
}

export function ForwardMessageDialog({
  isOpen,
  onOpenChange,
  message,
  contacts,
}: ForwardMessageDialogProps) {
  const [recipients, setRecipients] = useState<string[]>([]);
  const { toast } = useToast();
  const { forwardMessage } = useChat();

  const handleForward = () => {
    if (recipients.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No Recipients Selected',
        description: 'Please select at least one contact to forward the message to.',
      });
      return;
    }
    
    forwardMessage(message, recipients);
    
    toast({
      title: 'Message Forwarded',
      description: `Your message has been forwarded to ${recipients.length} contact(s).`,
    });
    
    onOpenChange(false);
    setRecipients([]);
  };
  
  const contactOptions = contacts.map(c => ({ value: c.id, label: c.name }));

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Forward Message</DialogTitle>
          <DialogDescription>Select who you want to forward this message to.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <div className="p-3 bg-muted rounded-md text-sm text-muted-foreground truncate">
                {`Forwarding: "${message.content || message.type}"`}
            </div>
            <MultiSelectCombobox
                options={contactOptions}
                selected={recipients}
                onChange={setRecipients}
                placeholder="Select contacts..."
            />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleForward} disabled={recipients.length === 0}>
            Forward
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
