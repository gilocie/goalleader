
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
import { Textarea } from '@/components/ui/textarea';
import { Task, useTimeTracker } from '@/context/time-tracker-context';
import { refineText, RefineTextInput } from '@/ai/flows/refine-text-flow';
import { Bot, Loader2 } from 'lucide-react';

interface CompleteTaskDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  task: Task;
  onConfirm: (description: string) => void;
}

export function CompleteTaskDialog({
  isOpen,
  onOpenChange,
  task,
  onConfirm,
}: CompleteTaskDialogProps) {
  const [description, setDescription] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const { time, tasks } = useTimeTracker();

  useEffect(() => {
    if (task) {
        setDescription(task.description || '');
    }
  }, [task]);

  const handleConfirm = () => {
    onConfirm(description);
    onOpenChange(false);
    setDescription('');
  };

  const handleRefineText = async () => {
    if (!description.trim()) return;
    setIsRefining(true);
    try {
      const completedTasks = tasks
        .filter(t => t.status === 'Completed')
        .map(t => ({ name: t.name, endTime: t.endTime?.toString() }));

      const input: RefineTextInput = {
        report: description,
        tasks: completedTasks,
      };

      const refined = await refineText(input);
      setDescription(refined);
    } catch (error) {
      console.error('Failed to refine text:', error);
      // Optionally, show a toast notification to the user
    } finally {
      setIsRefining(false);
    }
  };

  const formatTime = (seconds: number) => {
    const getSeconds = `0${seconds % 60}`.slice(-2);
    const minutes = Math.floor(seconds / 60);
    const getMinutes = `0${minutes % 60}`.slice(-2);
    const getHours = `0${Math.floor(seconds / 3600)}`.slice(-2);
    return `${getHours}:${getMinutes}:${getSeconds}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complete Task: {task.name}</DialogTitle>
          <DialogDescription>
            You are about to mark this task as complete. This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-sm">
            <span className="font-semibold">Time Spent:</span>{' '}
            <span className="font-mono">{formatTime(time)}</span>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">
              What did you accomplish?
            </Label>
            <Textarea
              id="description"
              placeholder="e.g., I integrated the new API and tested all endpoints..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <Button
            onClick={handleRefineText}
            disabled={isRefining || !description.trim()}
            variant="outline"
            size="sm"
          >
            {isRefining ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Bot className="mr-2 h-4 w-4" />
            )}
            Refine with AI
          </Button>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!description.trim()}>
            Confirm Completion
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
