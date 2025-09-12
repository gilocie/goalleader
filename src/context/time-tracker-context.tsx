
'use client';

import React, { createContext, useState, useContext, useEffect, useRef, ReactNode } from 'react';

interface TimeTrackerContextType {
  time: number;
  isActive: boolean;
  activeTask: string | null;
  handleStartStop: () => void;
  handleReset: () => void;
  startTask: (taskName: string) => void;
  completeTask: (taskName: string) => void;
  handleStop: () => void;
}

const TimeTrackerContext = createContext<TimeTrackerContextType | undefined>(undefined);

export const TimeTrackerProvider = ({ children }: { children: ReactNode }) => {
  const [time, setTime] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [activeTask, setActiveTask] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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
    }
  };

  const completeTask = (taskName: string) => {
    if (activeTask === taskName) {
      setIsActive(false);
      // Optionally do something with the final time, like logging it.
      console.log(`Task "${taskName}" completed in ${time} seconds.`);
      setActiveTask(null);
      // Do not reset time here so it can be seen in the tracker until a new task starts.
    }
  };
  
  const handleStop = () => {
    setIsActive(false);
    setActiveTask(null);
    setTime(0);
  };


  const value = {
    time,
    isActive,
    activeTask,
    handleStartStop,
    handleReset,
    startTask,
    completeTask,
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
