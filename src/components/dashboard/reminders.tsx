
'use client';

import { useTimeTracker } from '@/context/time-tracker-context';
import { Video, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';

export function Reminders() {
  const { tasks, startTask } = useTimeTracker();

  const upcomingTasks = useMemo(() => {
    return tasks
      .filter(task => task.status === 'Pending')
      .sort((a, b) => {
        const dateA = new Date(a.dueDate).getTime();
        const dateB = new Date(b.dueDate).getTime();
        return dateA - dateB;
      })
      .slice(0, 2);
  }, [tasks]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Reminders
        </CardTitle>
        <CardDescription>Your next upcoming tasks.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {upcomingTasks.length > 0 ? (
          upcomingTasks.map(task => (
            <div key={task.id} className="flex flex-col gap-2 p-3 rounded-lg bg-muted border">
              <div className="space-y-1">
                <p className="text-base font-semibold leading-none">
                  {task.name}
                </p>
                <p className="text-sm text-muted-foreground">
                    Due: {format(parseISO(task.dueDate), "MMM d, yyyy")} at {task.startTime?.toString()}
                </p>
              </div>
              <Button onClick={() => startTask(task.id)}>
                <Video className="mr-2 h-4 w-4" /> Start Task
              </Button>
            </div>
          ))
        ) : (
          <div className="text-center text-muted-foreground py-4">
            No upcoming tasks.
          </div>
        )}
        {tasks.length > 2 && (
            <Button variant="link" size="sm" asChild className="p-0 h-auto">
                <Link href="/tasks">
                    View all tasks
                </Link>
            </Button>
        )}
      </CardContent>
    </Card>
  );
}
