
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Bot, Loader2 } from 'lucide-react';
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
import { getTaskSuggestions } from '@/ai/flows/task-suggestion-flow';
import { Textarea } from '../ui/textarea';
import { ScrollArea } from '../ui/scroll-area';

interface AddTaskDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onTaskAdd: (task: any) => void;
}

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  date: z.date({ required_error: "A date is required." }),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
});

type TaskFormValues = z.infer<typeof taskSchema>;

export function AddTaskDialog({
  isOpen,
  onOpenChange,
  onTaskAdd,
}: AddTaskDialogProps) {
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
        title: '',
        description: '',
        date: new Date(),
    }
  });

  const onSubmit = (data: TaskFormValues) => {
    // In a real app, you would combine date and time properly.
    // For this demo, we'll just format the date.
    onTaskAdd({
        name: data.title,
        description: data.description,
        dueDate: data.date, 
    });
    form.reset();
    setSuggestions([]);
  };

  const handleGetSuggestions = async () => {
    // In a real app, you would get the user's department from their profile.
    const userDepartment = 'Engineering';

    setIsSuggesting(true);
    try {
        const result = await getTaskSuggestions({ department: userDepartment });
        setSuggestions(result.suggestions);
    } catch (error) {
        console.error("Failed to get suggestions", error);
    } finally {
        setIsSuggesting(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    form.setValue('title', suggestion);
    setSuggestions([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md h-[calc(100vh-80px)] sm:h-auto sm:max-h-[calc(100vh-40px)] flex flex-col p-0">
        <Form {...form}>
          <DialogHeader className="p-6 pb-2">
              <div className='flex justify-between items-center'>
                  <div>
                      <DialogTitle>Add New Task</DialogTitle>
                      <DialogDescription>
                          Fill in the details for the new task.
                      </DialogDescription>
                  </div>
                  <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                          <FormItem>
                          <Popover>
                              <PopoverTrigger asChild>
                              <FormControl>
                                  <Button
                                  variant={"outline"}
                                  className={cn(
                                      "w-[140px] justify-start text-left font-normal bg-gradient-to-r from-primary to-green-700 text-primary-foreground hover:from-primary/90 hover:to-green-700/90",
                                      !field.value && "text-muted-foreground"
                                  )}
                                  >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {field.value ? (
                                      format(field.value, "MMM d")
                                  ) : (
                                      <span>Pick a date</span>
                                  )}
                                  </Button>
                              </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="end">
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
              </div>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 overflow-hidden flex flex-col">
              <ScrollArea className="flex-1">
                  <div className="px-6 py-4 space-y-4">
                      <FormField
                          control={form.control}
                          name="title"
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
                                  <Textarea placeholder="Description" {...field} />
                              </FormControl>
                              <FormMessage />
                              </FormItem>
                          )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                          <FormField
                              control={form.control}
                              name="startTime"
                              render={({ field }) => (
                                  <FormItem>
                                      <FormControl>
                                          <Input type="time" {...field} />
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
                                          <Input type="time" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                  </FormItem>
                              )}
                          />
                      </div>

                      <div className="space-y-2">
                          <Button
                              type="button"
                              onClick={handleGetSuggestions}
                              disabled={isSuggesting}
                              variant="outline"
                              className='w-full'
                          >
                              {isSuggesting ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                              <Bot className="mr-2 h-4 w-4" />
                              )}
                              Get AI Suggestions
                          </Button>
                          {suggestions.length > 0 && (
                              <div className="space-y-2 rounded-md border p-2">
                                  <p className='text-sm font-medium'>Suggestions:</p>
                                  {suggestions.map((s, i) => (
                                      <Button
                                          key={i}
                                          variant="ghost"
                                          size="sm"
                                          className="w-full justify-start text-left h-auto"
                                          onClick={() => handleSuggestionClick(s)}
                                      >
                                          {s}
                                      </Button>
                                  ))}
                              </div>
                          )}
                      </div>
                  </div>
              </ScrollArea>

              <DialogFooter className="p-6 pt-4 border-t sticky bottom-0 bg-background z-10">
                  <Button type="submit" className="bg-gradient-to-r from-primary to-green-700 text-primary-foreground hover:from-primary/90 hover:to-green-700/90 w-full">
                      Add Task
                  </Button>
              </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
