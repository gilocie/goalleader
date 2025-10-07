
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
import { Send, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Switch } from '../ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Input } from '../ui/input';

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
  const [sendToAll, setSendToAll] = useState(false);
  const [schedule, setSchedule] = useState(false);
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState('10:00');
  const { toast } = useToast();

  const handleSend = () => {
    const finalRecipients = sendToAll ? clientLeadsForCombobox.map(c => c.label) : recipients;
    // In a real app, this would trigger an email or other notification service.
    console.log({
      content: selectedContent.map(c => c.blogTitle),
      recipients: finalRecipients,
      scheduled: schedule ? `${format(date!, 'PPP')} at ${time}` : 'Now',
    });

    const description = schedule
      ? `Your content has been scheduled to be sent to ${finalRecipients.length} client(s) on ${format(date!, 'PPP')} at ${time}.`
      : `Your selected marketing materials have been sent to ${finalRecipients.length} client(s).`;

    toast({
        title: schedule ? "Content Scheduled!" : "Content Sent!",
        description,
    });
    onOpenChange(false);
  };
  
  const handleDialogChange = (open: boolean) => {
    if (!open) {
        setRecipients([]);
        setSendToAll(false);
        setSchedule(false);
        setDate(undefined);
        setTime('10:00');
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

        <ScrollArea className="flex-1 overflow-y-auto px-6 space-y-4">
            <div className="space-y-2">
                <Label>Selected Content</Label>
                <div className="h-24 rounded-md border p-2">
                    <ul className="list-disc pl-5 text-sm text-muted-foreground">
                        {selectedContent.map(c => <li key={c.blogTitle}>{c.blogTitle}</li>)}
                    </ul>
                </div>
            </div>

            <div className="flex items-center space-x-2">
                <Switch id="send-to-all" checked={sendToAll} onCheckedChange={setSendToAll} />
                <Label htmlFor="send-to-all">Send to all clients</Label>
            </div>

            <div className="space-y-2">
                <Label>Recipients</Label>
                <MultiSelectCombobox 
                    options={clientLeadsForCombobox}
                    selected={recipients}
                    onChange={setRecipients}
                    placeholder="Select clients..."
                    disabled={sendToAll}
                />
            </div>

            <div className="space-y-4 rounded-md border p-4">
                <div className="flex items-center space-x-2">
                    <Switch id="schedule-send" checked={schedule} onCheckedChange={setSchedule} />
                    <Label htmlFor="schedule-send">Schedule for later</Label>
                </div>
                {schedule && (
                    <div className="grid grid-cols-2 gap-4">
                        <Popover>
                            <PopoverTrigger asChild>
                            <Button
                                variant={'outline'}
                                className={cn(
                                'justify-start text-left font-normal',
                                !date && 'text-muted-foreground'
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, 'PPP') : <span>Pick a date</span>}
                            </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                initialFocus
                            />
                            </PopoverContent>
                        </Popover>
                         <Input 
                            id="time"
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                        />
                    </div>
                )}
            </div>
        </ScrollArea>
        
        <DialogFooter className="p-6 pt-4 border-t mt-auto">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={handleSend}
            disabled={(!sendToAll && recipients.length === 0) || (schedule && !date)}
          >
            <Send className="mr-2 h-4 w-4" />
            {schedule ? 'Schedule' : `Send to ${sendToAll ? clientLeadsForCombobox.length : recipients.length} client(s)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
