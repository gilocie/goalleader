
'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Loader2, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AISuggestedMeeting } from '@/app/meetings/page';
import { generateAgenda } from '@/ai/flows/generate-agenda-flow';
import { MultiSelectCombobox } from './multi-select-combobox';
import { allUsers } from '@/lib/users';
import { ScrollArea } from '../ui/scroll-area';


interface ScheduleMeetingDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  suggestion: AISuggestedMeeting | null;
}

export function ScheduleMeetingDialog({
  isOpen,
  onOpenChange,
  suggestion,
}: ScheduleMeetingDialogProps) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState('10:00');
  const [agenda, setAgenda] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [participants, setParticipants] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (suggestion) {
        setTitle(suggestion.title);
        // Prefill participants
        const initialParticipants = allUsers
            .filter(user => suggestion.participants.includes(user.label))
            .map(user => user.value);
        setParticipants(initialParticipants);

        // Generate agenda
        const fetchAgenda = async () => {
          setIsGenerating(true);
          setAgenda('');
          try {
            const generatedAgenda = await generateAgenda({
              title: suggestion.title,
              reason: suggestion.reason,
            });
            setAgenda(generatedAgenda);
          } catch (error) {
            console.error('Failed to generate agenda:', error);
            setAgenda('Could not generate agenda. Please write one manually.');
          } finally {
            setIsGenerating(false);
          }
        };
        fetchAgenda();
      } else {
        // Reset fields for "Create New Meeting"
        setTitle('');
        setAgenda('');
        setParticipants([]);
        setDate(new Date());
        setTime('10:00');
      }
    }
  }, [isOpen, suggestion]);

  const handleConfirm = () => {
    // Logic to schedule the meeting would go here
    console.log({
        title,
        date,
        time,
        agenda,
        participants,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl flex flex-col h-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{suggestion ? `Schedule Meeting: ${suggestion.title}` : 'Create New Meeting'}</DialogTitle>
          <DialogDescription>
            {suggestion ? 'Confirm the details for this meeting.' : 'Fill in the details for your new meeting.'}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className='-mx-6 px-6'>
            <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                    Title
                </Label>
                <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="col-span-3"
                    placeholder="Meeting Title"
                />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">
                Date & Time
                </Label>
                <div className="col-span-3 grid grid-cols-2 gap-2">
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
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="participants" className="text-right">
                    Participants
                </Label>
                <div className="col-span-3">
                    <MultiSelectCombobox 
                        options={allUsers}
                        selected={participants}
                        onChange={setParticipants}
                        placeholder="Select participants..."
                    />
                </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="agenda" className="text-right pt-2">
                Agenda
                </Label>
                <div className="col-span-3">
                {isGenerating ? (
                    <div className="h-40 flex items-center justify-center bg-muted rounded-md">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                ) : (
                    <Textarea
                    id="agenda"
                    value={agenda}
                    onChange={(e) => setAgenda(e.target.value)}
                    className="h-40"
                    />
                )}
                </div>
            </div>
            </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            Confirm Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
