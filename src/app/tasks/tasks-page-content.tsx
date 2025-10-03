'use client';

import { useState } from 'react';
import {
  MoreHorizontal,
  Play,
  Check,
  Circle,
  Square,
  Eye,
  PlusCircle,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTimeTracker } from '@/context/time-tracker-context';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CompleteTaskDialog } from '@/components/dashboard/complete-task-dialog';
import { TaskDetailsDialog } from '@/components/dashboard/task-details-dialog';
import { AddTaskDialog } from '@/components/dashboard/add-task-dialog';

const StatusIndicator = ({ status }: { status: string }) => {
  switch (status) {
    case 'Completed':
      return (
        <div className="flex items-center gap-2 text-primary">
          <Check className="h-4 w-4" />
          <span>Completed</span>
        </div>
      );
    case 'In Progress':
      return (
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
          </span>
          <span>In Progress</span>
        </div>
      );
    case 'Pending':
      return (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Circle className="h-3 w-3" fill="currentColor" />
          <span>Pending</span>
        </div>
      );
    default:
      return <span>{status}</span>;
  }
};

export function TasksPageContent() {
  const {
    tasks,
    startTask,
    handleStop,
    isCompleteTaskOpen,
    setCompleteTaskOpen,
    isTaskDetailsOpen,
    setTaskDetailsOpen,
    setSelectedTask,
    selectedTask,
    addTask,
  } = useTimeTracker();

  const [isAddTaskOpen, setAddTaskOpen] = useState(false);

  const handleStopClick = (taskName: string) => {
    const task = tasks.find((t) => t.name === taskName);
    if (task) {
      setSelectedTask(task);
      setCompleteTaskOpen(true);
    }
  };

  const handleViewDetailsClick = (taskName: string) => {
    const task = tasks.find((t) => t.name === taskName);
    if (task) {
      setSelectedTask(task);
      setTaskDetailsOpen(true);
    }
  };

  const ongoingTasks = tasks.filter((task) => task.status !== 'Completed');

  return (
    <>
      <main className="flex-grow p-4 md:p-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
              <div>
                  <CardTitle>Today's Tasks</CardTitle>
                  <CardDescription>A list of your ongoing tasks for today.</CardDescription>
              </div>
              <Button 
                  onClick={() => setAddTaskOpen(true)}
              >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create New Task
              </Button>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[460px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead className="text-right">Due Date</TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ongoingTasks.map((task) => (
                    <TableRow key={task.name}>
                      <TableCell className="font-medium">{task.name}</TableCell>
                      <TableCell>
                        <StatusIndicator status={task.status} />
                      </TableCell>
                      <TableCell>
                        {task.status === 'Pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startTask(task.name)}
                          >
                            <Play className="mr-2 h-4 w-4" />
                            Start
                          </Button>
                        )}
                        {task.status === 'In Progress' && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleStopClick(task.name)}
                          >
                            <Square className="mr-2 h-4 w-4" />
                            Stop
                          </Button>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {task.dueDate}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              aria-haspopup="true"
                              size="icon"
                              variant="ghost"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleViewDetailsClick(task.name)}>
                              <Eye className="mr-2 h-4 w-4" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </main>
      <AddTaskDialog 
        isOpen={isAddTaskOpen}
        onOpenChange={setAddTaskOpen}
        onTaskAdd={(task) => {
            addTask(task);
            setAddTaskOpen(false);
        }}
      />
      {selectedTask && (
        <>
          <CompleteTaskDialog
            isOpen={isCompleteTaskOpen}
            onOpenChange={setCompleteTaskOpen}
            task={selectedTask}
            onConfirm={handleStop}
          />
          <TaskDetailsDialog
            isOpen={isTaskDetailsOpen}
            onOpenChange={setTaskDetailsOpen}
            task={selectedTask}
          />
        </>
      )}
    </>
  );
}
