
'use client';

import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "../ui/scroll-area";
import { useTimeTracker, Task } from "@/context/time-tracker-context";
import { Calendar } from '../ui/calendar';
import { Badge } from '../ui/badge';
import { format, isSameDay, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { Check, Clock } from 'lucide-react';

export function AgendaDropdown({ children }: { children: React.ReactNode }) {
    const { tasks } = useTimeTracker();
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

    const scheduledDays = tasks.map(task => parseISO(task.dueDate));
    const completedDays = tasks
        .filter(task => task.status === 'Completed' && task.endTime)
        .map(task => new Date(task.endTime!));
    
    const modifiers = {
        scheduled: scheduledDays,
        completed: completedDays,
    };
    
    const modifiersStyles = {
        scheduled: {
            borderColor: 'hsl(var(--primary))',
            borderWidth: '2px',
            borderRadius: 'var(--radius)',
        },
        completed: {
            color: 'hsl(var(--primary-foreground))',
            backgroundColor: 'hsl(var(--primary))',
        },
    };

    const tasksForSelectedDay = selectedDate 
        ? tasks.filter(task => isSameDay(parseISO(task.dueDate), selectedDate) || (task.endTime && isSameDay(new Date(task.endTime), selectedDate)))
        : [];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {children}
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 md:w-96 p-0" align="end">
                <DropdownMenuLabel className="p-3">
                    <span className="font-semibold">Task Calendar</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    modifiers={modifiers}
                    modifiersStyles={modifiersStyles}
                />
                <DropdownMenuSeparator />
                <div className="p-2">
                    <h4 className="px-2 py-1 text-sm font-semibold">
                        Tasks for {selectedDate ? format(selectedDate, 'PPP') : 'selected date'}
                    </h4>
                    <ScrollArea className="h-40">
                         <div className="p-2 space-y-2">
                            {tasksForSelectedDay.length > 0 ? (
                                tasksForSelectedDay.map(task => (
                                <div key={task.name} className="flex items-center justify-between text-sm p-2 rounded-md bg-muted/50">
                                    <span className="truncate pr-2">{task.name}</span>
                                    {task.status === 'Completed' ? (
                                        <Badge variant="default" className="flex-shrink-0">
                                            <Check className="mr-1 h-3 w-3" /> Completed
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary" className="flex-shrink-0">
                                           <Clock className="mr-1 h-3 w-3" /> {task.status}
                                        </Badge>
                                    )}
                                </div>
                                ))
                            ) : (
                                <div className="text-center text-muted-foreground p-4 text-sm">
                                    No tasks for this day.
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
