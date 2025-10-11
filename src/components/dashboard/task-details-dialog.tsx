
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Task } from '@/context/time-tracker-context';
import { format, formatDistance } from 'date-fns';
import type { Timestamp } from 'firebase/firestore';

interface TaskDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  task: Task;
}

export function TaskDetailsDialog({
  isOpen,
  onOpenChange,
  task,
}: TaskDetailsDialogProps) {
  const formatTime = (totalSeconds: number = 0) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    let result = '';
    if (hours > 0) result += `${hours}h `;
    if (minutes > 0) result += `${minutes}m `;
    if (seconds > 0 || (hours === 0 && minutes === 0)) result += `${seconds}s`;

    return result.trim();
  };

  const formatDate = (dateValue?: string | Timestamp) => {
    if (!dateValue) return 'N/A';
    
    let date;
    if (typeof dateValue === 'string') {
        // Handle ISO string or simple time string
        if (dateValue.includes('T')) {
            date = new Date(dateValue);
        } else {
            return dateValue; // It's just a time string like "10:00"
        }
    } else if (dateValue && typeof dateValue.toDate === 'function') {
        // Handle Firestore Timestamp
        date = dateValue.toDate();
    } else {
        return 'Invalid Date';
    }

    return format(date, 'PPpp');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Task Details: {task.name}</DialogTitle>
          <DialogDescription>
            A summary of the completed task.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <div>
            <h3 className="font-semibold text-base mb-2">Description</h3>
            <p className="text-muted-foreground bg-muted p-3 rounded-md">
              {task.description || 'No description was provided.'}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold">Time Started</h3>
              <p className="text-muted-foreground">{formatDate(task.startTime)}</p>
            </div>
            <div>
              <h3 className="font-semibold">Time Ended</h3>
              <p className="text-muted-foreground">{formatDate(task.endTime)}</p>
            </div>
            <div>
              <h3 className="font-semibold">Total Duration</h3>
              <p className="text-muted-foreground">{formatTime(task.duration)}</p>
            </div>
             <div>
              <h3 className="font-semibold">Status</h3>
              <p className="text-muted-foreground">{task.status}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
