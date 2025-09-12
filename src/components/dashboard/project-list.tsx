
'use client';
import { MoreHorizontal, Play, Check, Circle, Pause } from 'lucide-react';
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
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';
import { useState } from 'react';

const initialTasks = [
  {
    name: 'Design landing page',
    status: 'In Progress',
    dueDate: '2024-07-25',
  },
  {
    name: 'Develop API for user authentication',
    status: 'Completed',
    dueDate: '2024-07-15',
  },
  {
    name: 'Setup database schema',
    status: 'Pending',
    dueDate: '2024-08-01',
  },
  {
    name: 'Deploy to production',
    status: 'Pending',
    dueDate: '2024-08-15',
  },
  {
    name: 'Write documentation',
    status: 'In Progress',
    dueDate: '2024-08-10',
  },
    {
    name: 'Fix login bug',
    status: 'Pending',
    dueDate: '2024-08-05',
  },
  {
    name: 'Refactor chart component',
    status: 'In Progress',
    dueDate: '2024-08-12',
  },
  {
    name: 'Add new payment gateway',
    status: 'Pending',
    dueDate: '2024-09-01',
  },
];

const StatusIndicator = ({ status }: { status: string }) => {
  switch (status) {
    case 'Completed':
      return (
        <div className="flex items-center gap-2">
          <Check className="h-4 w-4 text-primary" />
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
  const { activeTask, isActive, startTask, completeTask } = useTimeTracker();
  const [tasks, setTasks] = useState(initialTasks);

  const handleCompleteTask = (taskName: string) => {
    completeTask(taskName);
    setTasks(currentTasks => 
      currentTasks.map(t => 
        t.name === taskName ? { ...t, status: 'Completed' } : t
      )
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>ToDo List</CardTitle>
        <CardDescription>A list of your tasks.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
                <TableHead className="hidden md:table-cell text-right">Due Date</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
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
                        onClick={() => {
                          startTask(task.name);
                          setTasks(currentTasks => 
                            currentTasks.map(t => 
                              t.name === task.name ? { ...t, status: 'In Progress' } : t
                            )
                          );
                        }}
                        disabled={!!activeTask}
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Start
                      </Button>
                    )}
                    {task.status === 'In Progress' && activeTask === task.name && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleCompleteTask(task.name)}
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Complete
                      </Button>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-right">{task.dueDate}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
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
  );
}
