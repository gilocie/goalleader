
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useTimeTracker } from '@/context/time-tracker-context';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';

export function DailyTodoList() {
    const { tasks } = useTimeTracker();
    const today = format(new Date(), 'yyyy-MM-dd');
    
    // For demo purposes, we'll show a mix of tasks regardless of date.
    // In a real app, you would filter for tasks assigned to the specific user and for today.
    const todaysTasks = tasks.slice(0, 5);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Today's To-Do List</CardTitle>
                <CardDescription>Tasks scheduled for today.</CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-64">
                    <div className="space-y-4">
                        {todaysTasks.map(task => (
                            <div key={task.name} className="flex items-center gap-4 p-2 rounded-md hover:bg-muted/50">
                                <Checkbox 
                                    id={`task-${task.name}`} 
                                    checked={task.status === 'Completed'} 
                                    aria-label={`Mark ${task.name} as complete`}
                                />
                                <label htmlFor={`task-${task.name}`} className="flex-1">
                                    <p className="font-medium">{task.name}</p>
                                    <p className="text-sm text-muted-foreground">Due: {task.dueDate}</p>
                                </label>
                            </div>
                        ))}
                         {todaysTasks.length === 0 && (
                            <p className="text-muted-foreground text-center py-8">No tasks for today.</p>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
