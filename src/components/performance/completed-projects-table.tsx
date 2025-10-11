
'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Eye,
  MoreHorizontal,
  FileText
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
    Tabs,
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
import { format, isWithinInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { CreateReportDialog } from './create-report-dialog';
import type { Timestamp } from 'firebase/firestore';


export type FilterType = 'recent' | 'thisWeek' | 'thisMonth';

export function CompletedProjectsTable() {
  const { tasks, setTaskDetailsOpen, setSelectedTask, selectedTask, isTaskDetailsOpen } = useTimeTracker();
  const [activeFilter, setActiveFilter] = useState<FilterType>('recent');
  const [isReportDialogOpen, setReportDialogOpen] = useState(false);
  const [tasksForReport, setTasksForReport] = useState<Task[]>([]);

  const handleViewDetailsClick = (task: Task) => {
    setSelectedTask(task);
    setTaskDetailsOpen(true);
  };

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

    return format(date, 'MMM d, yy');
  };

  const filteredTasks = useMemo(() => {
    const completed = tasks.filter(t => t.status === 'Completed' && t.endTime);
    const now = new Date();

    switch (activeFilter) {
      case 'thisWeek':
        return completed.filter(t => {
            if (!t.endTime) return false;
            const endDate = (t.endTime as Timestamp).toDate ? (t.endTime as Timestamp).toDate() : new Date(t.endTime as string);
            return isWithinInterval(endDate, { start: startOfWeek(now), end: endOfWeek(now) });
        });
      case 'thisMonth':
        return completed.filter(t => {
            if (!t.endTime) return false;
            const endDate = (t.endTime as Timestamp).toDate ? (t.endTime as Timestamp).toDate() : new Date(t.endTime as string);
            return isWithinInterval(endDate, { start: startOfMonth(now), end: endOfMonth(now) });
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

  useEffect(() => {
    setTasksForReport(filteredTasks);
  }, [filteredTasks]);


  return (
    <>
      <Card>
        <CardHeader className="space-y-4">
            <div>
                <CardTitle>Completed Projects</CardTitle>
                <CardDescription>
                    A list of your completed tasks. Create a report for your manager.
                </CardDescription>
            </div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 bg-secondary rounded-lg">
                <Button onClick={() => setReportDialogOpen(true)}>
                    <FileText className="mr-2 h-4 w-4" />
                    Create Report
                </Button>
                <Tabs value={activeFilter} onValueChange={(value) => setActiveFilter(value as FilterType)}>
                    <TabsList>
                        <TabsTrigger value="recent">Recent</TabsTrigger>
                        <TabsTrigger value="thisWeek">This Week</TabsTrigger>
                        <TabsTrigger value="thisMonth">This Month</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center p-4 border-b">
            <div className="flex-1 grid grid-cols-3 gap-4 font-medium text-muted-foreground">
                <div className="col-span-1">Task</div>
                <div className="col-span-1">Date</div>
                <div className="col-span-1">Duration</div>
            </div>
            <div className="w-20 text-right font-medium text-muted-foreground">Actions</div>
          </div>
          <ScrollArea className="h-[352px]">
             <div className="space-y-2 p-4">
                {filteredTasks.map((task) => (
                  <Card key={task.name} className="shadow-md hover:shadow-lg transition-shadow flex items-center p-4">
                    <div className="flex-1 grid grid-cols-3 gap-4 items-center">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                               <div className="font-medium col-span-1 truncate">{task.name}</div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{task.name}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <div className='col-span-1'>
                        {formatDate(task.endTime)}
                        </div>
                        <div className='col-span-1'>{formatTime(task.duration)}</div>
                    </div>
                    <div className="w-20 text-right">
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
                            <DropdownMenuItem>Archive</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                  </Card>
                ))}
              </div>
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
      <CreateReportDialog
        isOpen={isReportDialogOpen}
        onOpenChange={setReportDialogOpen}
        tasks={tasksForReport}
        period={activeFilter === 'thisMonth' ? 'This Month' : 'This Week'}
      />
    </>
  );
}
