
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTimeTracker, Task } from '@/context/time-tracker-context';
import { ScrollArea } from '../ui/scroll-area';
import { Button } from '../ui/button';
import { Play, MoreHorizontal, Eye, Trash2, AlertTriangle } from 'lucide-react';
import { format, isPast } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TaskDetailsDialog } from '../dashboard/task-details-dialog';
import { cn } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';


const TaskCard = ({ task, onStart, onView, onDelete }: { task: Task, onStart: (id: string) => void, onView: (task: Task) => void, onDelete: (task: Task) => void }) => {
    const isExpired = isPast(new Date(task.dueDate)) && task.status !== 'Completed';
    return (
        <Card className={cn("p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4", isExpired && "border-destructive")}>
            <div className="flex-1 flex items-start gap-3">
                 {isExpired && <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-1" />}
                <div>
                    <h4 className="font-semibold">{task.name}</h4>
                    <p className={cn("text-sm", isExpired ? "text-destructive" : "text-muted-foreground")}>
                        Due: {format(new Date(task.dueDate), 'PP')} | Starts: {task.startTime?.toString()}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                {task.status === 'Pending' && (
                    <Button onClick={() => onStart(task.id)} size="sm">
                        <Play className="mr-2 h-4 w-4" /> Start
                    </Button>
                )}
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onView(task)}>
                            <Eye className="mr-2 h-4 w-4" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(task)} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </Card>
    );
};

export function ProjectsView() {
    const { tasks, startTask, deleteTask } = useTimeTracker();
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    const { pending, running, expired } = useMemo(() => {
        const now = new Date();
        const pending: Task[] = [];
        const running: Task[] = [];
        const expired: Task[] = [];

        tasks.forEach(task => {
            if (task.status === 'In Progress') {
                running.push(task);
            } else if (task.status === 'Pending') {
                const dueDate = new Date(task.dueDate);
                // Set time to the end of the day to include today's tasks as not expired
                dueDate.setHours(23, 59, 59, 999); 
                
                if (isPast(dueDate)) {
                    expired.push(task);
                } else {
                    pending.push(task);
                }
            }
        });

        return { pending, running, expired };
    }, [tasks]);

    const handleViewDetails = (task: Task) => {
        setSelectedTask(task);
        setIsDetailsOpen(true);
    };

    const handleDeleteRequest = (task: Task) => {
        setTaskToDelete(task);
    };

    const handleDeleteConfirm = () => {
        if (taskToDelete) {
            deleteTask(taskToDelete.id);
            setTaskToDelete(null);
        }
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Projects Status</CardTitle>
                    <CardDescription>An overview of all your projects.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="running">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="running">Running ({running.length})</TabsTrigger>
                            <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
                            <TabsTrigger value="expired">Expired ({expired.length})</TabsTrigger>
                        </TabsList>
                        <TabsContent value="running" className="mt-4">
                            <ScrollArea className="h-[400px]">
                                <div className="space-y-3">
                                    {running.length > 0 ? running.map(task => (
                                        <TaskCard key={task.id} task={task} onStart={startTask} onView={handleViewDetails} onDelete={handleDeleteRequest} />
                                    )) : <p className="text-center text-muted-foreground p-4">No tasks are currently in progress.</p>}
                                </div>
                            </ScrollArea>
                        </TabsContent>
                        <TabsContent value="pending" className="mt-4">
                            <ScrollArea className="h-[400px]">
                                <div className="space-y-3">
                                    {pending.length > 0 ? pending.map(task => (
                                        <TaskCard key={task.id} task={task} onStart={startTask} onView={handleViewDetails} onDelete={handleDeleteRequest} />
                                    )) : <p className="text-center text-muted-foreground p-4">No pending tasks.</p>}
                                </div>
                            </ScrollArea>
                        </TabsContent>
                        <TabsContent value="expired" className="mt-4">
                            <ScrollArea className="h-[400px]">
                                <div className="space-y-3">
                                    {expired.length > 0 ? expired.map(task => (
                                        <TaskCard key={task.id} task={task} onStart={startTask} onView={handleViewDetails} onDelete={handleDeleteRequest} />
                                    )) : <p className="text-center text-muted-foreground p-4">No expired tasks.</p>}
                                </div>
                            </ScrollArea>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
            {selectedTask && (
                <TaskDetailsDialog
                    isOpen={isDetailsOpen}
                    onOpenChange={setIsDetailsOpen}
                    task={selectedTask}
                />
            )}
             <AlertDialog open={!!taskToDelete} onOpenChange={() => setTaskToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the task "{taskToDelete?.name}".
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
