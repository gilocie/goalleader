
'use client';

import { useState, useMemo } from 'react';
import {
  Eye,
  MoreHorizontal,
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
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
  } from "@/components/ui/tabs"
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Task, useTimeTracker } from '@/context/time-tracker-context';
import { ScrollArea } from '../ui/scroll-area';
import { TaskDetailsDialog } from '../dashboard/task-details-dialog';
import { format, isWithinInterval } from 'date-fns';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import type { Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

type FilterType = 'recent' | 'thisWeek' | 'thisMonth';

export function CompletedProjectsTable() {
  const { tasks, setTaskDetailsOpen, setSelectedTask, selectedTask, isTaskDetailsOpen, deleteTask } = useTimeTracker();
  const [activeFilter, setActiveFilter] = useState<FilterType>('recent');
  const { toast } = useToast();

  const handleViewDetailsClick = (task: Task) => {
    setSelectedTask(task);
    setTaskDetailsOpen(true);
  };

  const handleArchive = () => {
    toast({
      title: 'Coming Soon',
      description: 'Archiving tasks will be available in a future update.',
    });
  }

  const formatTime = (totalSeconds: number = 0) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    let result = '';
    if (hours > 0) result += `${hours}h `;
    if (minutes > 0) result += `${minutes}m `;
    if (seconds > 0 || (hours === 0 && minutes === 0)) result += `${seconds}s`;

    return result.trim() || '0s';
  };
  
  const formatDate = (dateValue?: string | Timestamp) => {
    if (!dateValue) return 'N/A';
    
    let date;
    if (typeof dateValue === 'string') {
        date = new Date(dateValue);
    } else if (dateValue && typeof (dateValue as Timestamp).toDate === 'function') {
        date = (dateValue as Timestamp).toDate();
    } else {
        return 'Invalid Date';
    }

    if (isNaN(date.getTime())) {
        return 'Invalid Date';
    }

    return format(date, 'PP');
  };

  const filteredTasks = useMemo(() => {
    const completed = tasks.filter(t => t.status === 'Completed' && t.endTime);
    const now = new Date();

    switch (activeFilter) {
      case 'thisWeek':
        return completed.filter(t => {
            if (!t.endTime) return false;
            const endDate = (t.endTime as Timestamp).toDate ? (t.endTime as Timestamp).toDate() : new Date(t.endTime);
            return isWithinInterval(endDate, {
                start: startOfWeek(now),
                end: endOfWeek(now),
            });
        });
      case 'thisMonth':
        return completed.filter(t => {
            if (!t.endTime) return false;
            const endDate = (t.endTime as Timestamp).toDate ? (t.endTime as Timestamp).toDate() : new Date(t.endTime);
            return isWithinInterval(endDate, {
                start: startOfMonth(now),
                end: endOfMonth(now),
            });
        });
      case 'recent':
      default:
        return completed.sort((a, b) => {
            const timeA = (a.endTime as Timestamp)?.toMillis() || 0;
            const timeB = (b.endTime as Timestamp)?.toMillis() || 0;
            return timeB - timeA;
        });
    }
  }, [tasks, activeFilter]);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Completed Projects</CardTitle>
                <CardDescription>
                    A list of your completed tasks.
                </CardDescription>
            </div>
            <Tabs value={activeFilter} onValueChange={(value) => setActiveFilter(value as FilterType)}>
                <TabsList>
                    <TabsTrigger value="recent">Recent</TabsTrigger>
                    <TabsTrigger value="thisWeek">This Week</TabsTrigger>
                    <TabsTrigger value="thisMonth">This Month</TabsTrigger>
                </TabsList>
            </Tabs>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Completed On</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">{task.name}</TableCell>
                    <TableCell>
                      {formatDate(task.endTime)}
                    </TableCell>
                    <TableCell>{formatTime(task.duration)}</TableCell>
                    <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewDetailsClick(task)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
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
                            <DropdownMenuItem onClick={handleArchive}>Archive</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => deleteTask(task.id)}>Delete</DropdownMenuItem>
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
        <TaskDetailsDialog
            isOpen={isTaskDetailsOpen}
            onOpenChange={setTaskDetailsOpen}
            task={selectedTask}
        />
      )}
    </>
  );
}
