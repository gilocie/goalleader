
'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Bot, Loader2, HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { getTaskSuggestions, TaskSuggestionInput, TaskSuggestionOutput } from '@/ai/flows/task-suggestion-flow';
import { Textarea } from '../ui/textarea';
import { ScrollArea } from '../ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Card, CardContent, CardHeader, CardFooter } from '../ui/card';
import { useTimeTracker, Task } from '@/context/time-tracker-context';

interface AddTaskDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onTaskSubmit: (task: any) => void;
  taskToEdit?: Task | null;
}

const taskSchema = z.object({
  name: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  dueDate: z.date({ required_error: "A date is required." }),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
});

type TaskFormValues = z.infer<typeof taskSchema>;
type Suggestion = TaskSuggestionOutput['suggestions'][0];

export function AddTaskDialog({
  isOpen,
  onOpenChange,
  onTaskSubmit,
  taskToEdit,
}: AddTaskDialogProps) {
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);
  const { tasks } = useTimeTracker();

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      name: '',
      description: '',
      dueDate: new Date(),
      startTime: '',
      endTime: '',
    }
  });

  useEffect(() => {
    if (taskToEdit) {
      form.reset({
        name: taskToEdit.name,
        description: taskToEdit.description || '',
        dueDate: new Date(taskToEdit.dueDate),
        startTime: taskToEdit.startTime?.toString() || '',
        endTime: taskToEdit.endTime?.toString() || '',
      });
    } else {
      form.reset({
        name: '',
        description: '',
        dueDate: new Date(),
        startTime: '',
        endTime: '',
      });
    }
  }, [taskToEdit, form, isOpen]);


  const onSubmit = (data: TaskFormValues) => {
    onTaskSubmit(data);
    form.reset();
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedSuggestion(null);
  };

  const handleGetSuggestions = async () => {
    if (isSuggesting) return;
    setIsSuggesting(true);
    try {
      const pendingTasks = tasks
        .filter(t => t.status === 'Pending' || t.status === 'In Progress')
        .map(t => ({ name: t.name, endTime: t.endTime?.toString() || '00:00' }));

      const input: TaskSuggestionInput = {
        department: 'Engineering',
        currentTime: format(new Date(), 'HH:mm'),
        pendingTasks,
      };
      const result = await getTaskSuggestions(input);
      setSuggestions(result.suggestions);
    } catch (error) {
      console.error("Failed to get suggestions", error);
    } finally {
      setIsSuggesting(false);
    }
  };

  const toggleSuggestionsPanel = () => {
      setShowSuggestions(prev => !prev);
  }

  const handleSuggestionClick = (suggestion: Suggestion) => {
    form.setValue('name', suggestion.title);
    form.setValue('description', suggestion.description);
    form.setValue('dueDate', new Date()); // Default to today's date
    form.setValue('startTime', suggestion.startTime);
    form.setValue('endTime', suggestion.endTime);
    setSelectedSuggestion(suggestion);
  };

  const handleCloseDialog = (open: boolean) => {
    if (!open) {
      setShowSuggestions(false);
      setSelectedSuggestion(null);
      form.reset();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseDialog}>
      <DialogContent
        className={cn(
          "sm:max-w-md h-[calc(100vh-80px)] sm:h-[580px] sm:max-h-[calc(100vh-40px)] p-0 transition-all duration-300 flex overflow-hidden",
          showSuggestions && "sm:max-w-4xl"
        )}
      >
        {/* --- Form Side --- */}
        <div className="w-full sm:flex-1 flex-shrink-0 flex flex-col relative">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
              <DialogHeader className="p-6 pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <DialogTitle>{taskToEdit ? 'Edit Task' : 'Add New Task'}</DialogTitle>
                    <DialogDescription>
                      {taskToEdit ? 'Update the details for this task.' : 'Fill in the details for the new task.'}
                    </DialogDescription>
                  </div>
                  <div className="flex items-center gap-2 -mt-2">
                     <DialogClose asChild>
                       <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full">
                         <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                       </Button>
                     </DialogClose>
                     <Button
                        onClick={toggleSuggestionsPanel}
                        type="button"
                        variant="default"
                        size="icon"
                        className="w-8 h-8 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center z-20 shadow-lg"
                      >
                       {showSuggestions ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                     </Button>
                  </div>
                </div>
              </DialogHeader>

              <ScrollArea className="flex-1">
                <div className="space-y-4 px-6 py-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea placeholder="Description" {...field} className="h-40" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="dueDate"
                      render={({ field }) => (
                        <FormItem>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {field.value ? (
                                    format(field.value, "MMM d, yyyy")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="startTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input type="time" placeholder="Start Time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="endTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input type="time" placeholder="End Time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </ScrollArea>

              <DialogFooter className="p-6 pt-4 border-t sticky bottom-0 bg-background z-10">
                <Button
                  type="submit"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 w-full"
                >
                  {taskToEdit ? 'Save Changes' : 'Add Task'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>

        {/* --- AI Suggestions Panel --- */}
        <div
          className={cn(
            "flex-shrink-0 transition-all duration-300 overflow-hidden",
            showSuggestions ? "w-full sm:flex-1" : "w-0"
          )}
        >
          <Card className="h-full flex flex-col rounded-none border-l relative">
            <CardHeader>
              <DialogTitle>AI Suggestions</DialogTitle>
              <DialogDescription>Pick a task to get started.</DialogDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto p-0">
              <ScrollArea className="h-full">
                <div className="space-y-4 p-4">
                  {isSuggesting && suggestions.length === 0 && (
                    <div className="flex items-center justify-center p-4 h-64">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  )}
                  {!isSuggesting && suggestions.length === 0 && (
                     <div className="flex items-center justify-center h-full">
                        <p className="text-sm text-muted-foreground">Click below to get suggestions.</p>
                     </div>
                  )}
                  {suggestions.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <TooltipProvider>
                        {suggestions.map((s, i) => (
                          <Card
                            key={i}
                            className={cn(
                                "p-3 cursor-pointer hover:bg-muted/80 transition-colors",
                                selectedSuggestion?.title === s.title && "bg-gradient-to-r from-primary/10 to-primary-dark/10"
                            )}
                            onClick={() => handleSuggestionClick(s)}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm font-medium truncate flex-1">{s.title}</span>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span className="text-xs text-muted-foreground">{s.duration}</span>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => e.stopPropagation()}>
                                      <HelpCircle className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" align="center" className="max-w-xs">
                                    <p>{s.description}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </TooltipProvider>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
             <CardFooter className="border-t p-6">
                <Button
                    onClick={handleGetSuggestions}
                    disabled={isSuggesting}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                    {isSuggesting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                    <Bot className="mr-2 h-4 w-4" />
                    )}
                    Use GoalLeader
                </Button>
            </CardFooter>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

