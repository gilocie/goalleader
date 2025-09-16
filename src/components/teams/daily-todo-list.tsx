
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useTimeTracker, Task } from '@/context/time-tracker-context';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { TaskDetailsDialog } from '../dashboard/task-details-dialog';
import { cn } from '@/lib/utils';

export function DailyTodoList() {
    const { tasks } = useTimeTracker();
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isDetailsOpen, setDetailsOpen] = useState(false);
    
    // For demo purposes, we'll show a mix of tasks regardless of date.
    // In a real app, you would filter for tasks assigned to the specific user and for today.
    const todaysTasks = tasks.slice(0, 5);

    const handleTaskClick = (task: Task) => {
        setSelectedTask(task);
        setDetailsOpen(true);
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Today's To-Do List</CardTitle>
                    <CardDescription>Tasks scheduled for today. Click a task to view details.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-64">
                        <div className="space-y-4">
                            {todaysTasks.map(task => (
                                <div 
                                    key={task.name} 
                                    className="flex items-center gap-4 p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                                    onClick={() => handleTaskClick(task)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => e.key === 'Enter' && handleTaskClick(task)}
                                >
                                    <div onClick={(e) => e.stopPropagation()}>
                                        <Checkbox 
                                            id={`task-${task.name}`} 
                                            checked={task.status === 'Completed'} 
                                            aria-label={`Mark ${task.name} as complete`}
                                        />
                                    </div>
                                    <label htmlFor={`task-${task.name}`} className="flex-1 cursor-pointer">
                                        <p className={cn("font-medium", task.status === 'Completed' && 'line-through text-muted-foreground')}>
                                            {task.name}
                                        </p>
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
            {selectedTask && (
                <TaskDetailsDialog
                    isOpen={isDetailsOpen}
                    onOpenChange={setDetailsOpen}
                    task={selectedTask}
                />
            )}
        </>
    );
}
