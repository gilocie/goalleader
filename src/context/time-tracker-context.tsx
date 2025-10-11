
'use client';

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
  ReactNode,
  useMemo,
  useCallback,
} from 'react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import type { Timestamp } from 'firebase/firestore';


export type Task = {
  id: string;
  name: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  dueDate: string;
  description?: string;
  startTime?: string | Timestamp;
  endTime?: string | Timestamp;
  duration?: number;
  userId: string;
  createdAt: Timestamp;
};

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
  startTask: (taskId: string) => void;
  handleStop: (taskId: string, description: string) => void;
  addTask: (task: Omit<Task, 'status' | 'id' | 'userId' | 'createdAt'>) => void;
}

const TimeTrackerContext = createContext<TimeTrackerContextType | undefined>(
  undefined
);

export const TimeTrackerProvider = ({ children }: { children: ReactNode }) => {
  const [time, setTime] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [activeTask, setActiveTask] = useState<string | null>(null);
  const [isCompleteTaskOpen, setCompleteTaskOpen] = useState(false);
  const [isTaskDetailsOpen, setTaskDetailsOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  
  const { user: firebaseUser } = useUser();
  const firestore = useFirestore();

  const todosQuery = useMemo(() => {
    if (!firestore || !firebaseUser) return null;
    return query(collection(firestore, 'users', firebaseUser.uid, 'todos'), orderBy('createdAt', 'desc'));
  }, [firestore, firebaseUser]);

  const { data: tasks, loading: tasksLoading } = useCollection<Task>(todosQuery);
  const completedTasksCount = useMemo(() => tasks.filter(t => t.status === 'Completed').length, [tasks]);

  useEffect(() => {
    // Sync active task on initial load
    const initiallyActiveTask = tasks.find((t) => t.status === 'In Progress');
    if (initiallyActiveTask) {
      setActiveTask(initiallyActiveTask.id);
      // You might want to calculate elapsed time if startTime is stored
    }
  }, [tasks]);

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

  const startTask = useCallback(async (taskId: string) => {
    if (!firestore || !firebaseUser) return;
    
    if (activeTask) {
      const currentActiveTask = tasks.find(t => t.id === activeTask);
      if (currentActiveTask) {
        const taskDocRef = doc(firestore, 'users', firebaseUser.uid, 'todos', currentActiveTask.id);
        await updateDoc(taskDocRef, { status: 'Pending' });
      }
    }

    const taskToStart = tasks.find(t => t.id === taskId);
    if (!taskToStart) return;

    const taskDocRef = doc(firestore, 'users', firebaseUser.uid, 'todos', taskId);
    await updateDoc(taskDocRef, { 
      status: 'In Progress',
      startTime: serverTimestamp() 
    }).catch(serverError => {
        const permissionError = new FirestorePermissionError({
            path: taskDocRef.path,
            operation: 'update',
            requestResourceData: { status: 'In Progress', startTime: new Date().toISOString() },
        });
        errorEmitter.emit('permission-error', permissionError);
    });

    setActiveTask(taskId);
    setTime(0);
    setIsActive(true);
  }, [firestore, firebaseUser, activeTask, tasks]);

  const handleStop = useCallback(async (taskId: string, description: string) => {
    if (!firestore || !firebaseUser || activeTask !== taskId) return;
    
    const taskDocRef = doc(firestore, 'users', firebaseUser.uid, 'todos', taskId);
    const endTime = serverTimestamp();
    
    await updateDoc(taskDocRef, {
      status: 'Completed',
      description,
      endTime,
      duration: time,
    }).catch(serverError => {
      const permissionError = new FirestorePermissionError({
          path: taskDocRef.path,
          operation: 'update',
          requestResourceData: { status: 'Completed', description, endTime: new Date().toISOString(), duration: time },
      });
      errorEmitter.emit('permission-error', permissionError);
    });

    setIsActive(false);
    setActiveTask(null);
    setTime(0);
  }, [firestore, firebaseUser, activeTask, time]);


  const addTask = useCallback(async (task: Omit<Task, 'status' | 'id' | 'userId' | 'createdAt'>) => {
    if (!firestore || !firebaseUser) {
        toast({ title: "Error", description: "You must be logged in to add a task.", variant: "destructive" });
        return;
    }
    const todosCollection = collection(firestore, 'users', firebaseUser.uid, 'todos');
    const newTaskData = {
        ...task,
        userId: firebaseUser.uid,
        status: 'Pending',
        createdAt: serverTimestamp(),
    };
    await addDoc(todosCollection, newTaskData).catch(serverError => {
        const permissionError = new FirestorePermissionError({
            path: todosCollection.path,
            operation: 'create',
            requestResourceData: newTaskData,
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  }, [firestore, firebaseUser, toast]);

    const handleStartStop = () => {
        if (isActive) {
            setIsActive(false); // Pause
        } else {
            if (activeTask) {
                setIsActive(true); // Resume
            } else {
                const firstPending = tasks.find(t => t.status === 'Pending');
                if (firstPending) {
                    startTask(firstPending.id);
                } else {
                    toast({
                        title: 'No Pending Tasks',
                        description: 'Add a new task to start the tracker.',
                        variant: 'destructive'
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
    addTask: (task: any) => {
      const formattedTask = {
        ...task,
        dueDate: format(task.dueDate as Date, 'yyyy-MM-dd'),
      };
      addTask(formattedTask as any);
    },
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
