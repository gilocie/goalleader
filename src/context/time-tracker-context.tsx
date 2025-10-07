
'use client';

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
  ReactNode,
} from 'react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export type Task = {
  name: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  dueDate: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
};

const initialTasks: Task[] = [];

interface TimeTrackerContextType {
  time: number;
  isActive: boolean;
  activeTask: string | null;
  tasks: Task[];
  completedTasksCount: number;
  isCompleteTaskOpen: boolean;
  setCompleteTaskOpen: (isOpen: boolean) => void;
  isTaskDetailsOpen: boolean;
  setTaskDetailsOpen: (isOpen: boolean) => void;
  selectedTask: Task | null;
  setSelectedTask: (task: Task | null) => void;
  handleStartStop: () => void;
  handleReset: () => void;
  startTask: (taskName: string) => void;
  handleStop: (taskName: string, description: string) => void;
  addTask: (task: Omit<Task, 'status'>) => void;
}

const TimeTrackerContext = createContext<TimeTrackerContextType | undefined>(
  undefined
);

export const TimeTrackerProvider = ({ children }: { children: ReactNode }) => {
  const [time, setTime] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [activeTask, setActiveTask] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [completedTasksCount, setCompletedTasksCount] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [isCompleteTaskOpen, setCompleteTaskOpen] = useState(false);
  const [isTaskDetailsOpen, setTaskDetailsOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Sync active task on initial load
    const initiallyActiveTask = tasks.find((t) => t.status === 'In Progress');
    if (initiallyActiveTask) {
      setActiveTask(initiallyActiveTask.name);
    }
    // Sync completed tasks count on initial load
    setCompletedTasksCount(tasks.filter((t) => t.status === 'Completed').length);
  }, []);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive]);

  const handleStartStop = () => {
    if (isActive) {
      // If a task is active, pause it.
      setIsActive(false);
    } else {
      // If no task is active...
      if (activeTask) {
        // ...but there's a paused task, resume it.
        setIsActive(true);
      } else {
        // ...and no task is paused, find the first pending task to start.
        const pendingTask = tasks.find((t) => t.status === 'Pending');
        if (pendingTask) {
          startTask(pendingTask.name);
        } else {
          // If there are no pending tasks, show a notification.
          toast({
            title: 'No Task to Start',
            description: 'Please add a new task to your to-do list before starting the tracker.',
            variant: 'destructive',
          });
        }
      }
    }
  };

  const handleReset = () => {
    setIsActive(false);
    setTime(0);
    setActiveTask(null);
  };

  const startTask = (taskName: string) => {
    if (activeTask && activeTask !== taskName) {
      // If another task is running, stop it first (without completing it)
      setTasks(currentTasks => 
        currentTasks.map(t => 
          t.name === activeTask ? {...t, status: 'Pending'} : t
        )
      );
    }

    const startTime = new Date().toISOString();
    setActiveTask(taskName);
    setTime(0);
    setIsActive(true);
    setTasks((currentTasks) =>
      currentTasks.map((t) =>
        t.name === taskName ? { ...t, status: 'In Progress', startTime } : t
      )
    );
  };

  const handleStop = (taskName: string, description: string) => {
    if (activeTask === taskName) {
      const endTime = new Date().toISOString();
      setIsActive(false);
      setActiveTask(null);
      setTasks((currentTasks) =>
        currentTasks.map((t) =>
          t.name === taskName
            ? {
                ...t,
                status: 'Completed',
                description,
                endTime,
                duration: time,
              }
            : t
        )
      );
      setTime(0);
      setCompletedTasksCount((prev) => prev + 1);
    }
  };

  const addTask = (task: Omit<Task, 'status' | 'dueDate'> & { dueDate: Date }) => {
    const newTask: Task = {
        ...task,
        status: 'Pending',
        dueDate: format(task.dueDate, 'yyyy-MM-dd'),
    };
    setTasks(prevTasks => [newTask, ...prevTasks]);
  };

  const value = {
    time,
    isActive,
    activeTask,
    tasks,
    completedTasksCount,
    handleStartStop,
    handleReset,
    startTask,
    handleStop,
    addTask,
    isCompleteTaskOpen,
    setCompleteTaskOpen,
    isTaskDetailsOpen,
    setTaskDetailsOpen,
    selectedTask,
    setSelectedTask,
  };

  return (
    <TimeTrackerContext.Provider value={value}>
      {children}
    </TimeTrackerContext.Provider>
  );
};

export const useTimeTracker = () => {
  const context = useContext(TimeTrackerContext);
  if (context === undefined) {
    throw new Error('useTimeTracker must be used within a TimeTrackerProvider');
  }
  return context;
};
