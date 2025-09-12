
'use client';
import {
  MoreHorizontal,
  Play,
  Check,
  Circle,
  Square,
  Eye,
  Pause,
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
  } = useTimeTracker();

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
        <CardHeader>
          <CardTitle>ToDo List</CardTitle>
          <CardDescription>A list of your ongoing tasks.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <Table>
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
                          disabled={!!activeTask}
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
          </ScrollArea>
        </CardContent>
      </Card>
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
