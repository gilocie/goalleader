
'use client';

import React, { createContext, useState, useContext, useEffect, useRef, ReactNode } from 'react';

type Task = {
  name: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  dueDate: string;
};

const initialTasks: Task[] = [
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


interface TimeTrackerContextType {
  time: number;
  isActive: boolean;
  activeTask: string | null;
  tasks: Task[];
  completedTasksCount: number;
  handleStartStop: () => void;
  handleReset: () => void;
  startTask: (taskName: string) => void;
  handleStop: (taskName: string) => void;
}

const TimeTrackerContext = createContext<TimeTrackerContextType | undefined>(undefined);

export const TimeTrackerProvider = ({ children }: { children: ReactNode }) => {
  const [time, setTime] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [activeTask, setActiveTask] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [completedTasksCount, setCompletedTasksCount] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Sync active task on initial load
    const initiallyActiveTask = tasks.find(t => t.status === 'In Progress');
    if (initiallyActiveTask) {
        setActiveTask(initiallyActiveTask.name);
    }
    // Sync completed tasks count on initial load
    setCompletedTasksCount(tasks.filter(t => t.status === 'Completed').length);
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
    if (activeTask) {
        setIsActive(!isActive);
    }
  };

  const handleReset = () => {
    setIsActive(false);
    setTime(0);
    setActiveTask(null);
  };
  
  const startTask = (taskName: string) => {
    if (!activeTask) {
      setActiveTask(taskName);
      setTime(0);
      setIsActive(true);
      setTasks(currentTasks =>
        currentTasks.map(t =>
          t.name === taskName ? { ...t, status: 'In Progress' } : t
        )
      );
    }
  };
  
  const handleStop = (taskName: string) => {
    if (activeTask === taskName) {
      setIsActive(false);
      setActiveTask(null);
      setTime(0);
      setTasks(currentTasks => 
        currentTasks.map(t => 
          t.name === taskName ? { ...t, status: 'Completed' } : t
        )
      );
      setCompletedTasksCount(prev => prev + 1);
    }
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
