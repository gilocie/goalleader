
'use client';
import { useState } from 'react';
import {
  MoreHorizontal,
  Play,
  Check,
  Circle,
  Square,
  Eye,
  Pause,
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
import { ScrollArea } from '../ui/scroll-area';
import { CompleteTaskDialog } from './complete-task-dialog';
import { TaskDetailsDialog } from './task-details-dialog';
import { AddTaskDialog } from './add-task-dialog';

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

export function ProjectList() {
  const {
    tasks,
    activeTask,
    startTask,
    handleStop,
    isCompleteTaskOpen,
    setCompleteTaskOpen,
    isTaskDetailsOpen,
    setTaskDetailsOpen,
    setSelectedTask,
    selectedTask,
    handleStartStop,
    isActive,
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
      <Card className="h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>ToDo List</CardTitle>
                <CardDescription>A list of your ongoing tasks.</CardDescription>
            </div>
            <Button 
                className="bg-gradient-to-r from-primary to-green-700 text-primary-foreground hover:from-primary/90 hover:to-green-700/90"
                onClick={() => setAddTaskOpen(true)}
            >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New
            </Button>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          {ongoingTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <p className="text-muted-foreground">No tasks available.</p>
              <p className="text-sm text-muted-foreground">Click "Add New" to get started.</p>
            </div>
          ) : (
            <ScrollArea className="h-full">
              <Table className="hidden md:table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead className="hidden md:table-cell text-right">
                      Due Date
                    </TableHead>
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
                      <TableCell className="hidden md:table-cell text-right">
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
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="grid gap-4 md:hidden">
                {ongoingTasks.map((task) => (
                  <Card key={task.name} className="flex flex-col">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                          <span className="font-medium flex-1">{task.name}</span>
                          <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                              <Button
                                  aria-haspopup="true"
                                  size="icon"
                                  variant="ghost"
                                  className="-mt-2 text-green-800"
                              >
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Toggle menu</span>
                              </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>Edit</DropdownMenuItem>
                              <DropdownMenuItem>Delete</DropdownMenuItem>
                              </DropdownMenuContent>
                          </DropdownMenu>
                      </div>
                      
                      <div className='flex justify-between items-center'>
                          <StatusIndicator status={task.status} />
                          
                          {task.status === 'Pending' && (
                              <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => startTask(task.name)}
                                  className="h-8 w-8 text-green-600 border-green-600"
                              >
                                  <Play className="h-4 w-4 text-green-600" />
                                  <span className='sr-only'>Start</span>
                              </Button>
                          )}
                          {task.status === 'In Progress' && (
                              <Button
                                  variant="destructive"
                                  size="icon"
                                  onClick={() => handleStopClick(task.name)}
                                  className="h-8 w-8"
                              >
                                  <Square className="h-4 w-4" />
                                  <span className='sr-only'>Stop</span>
                              </Button>
                          )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Due: {task.dueDate}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
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
