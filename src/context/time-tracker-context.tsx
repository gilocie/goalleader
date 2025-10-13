

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
import { format, differenceInMinutes } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, query, orderBy, deleteDoc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import type { Timestamp } from 'firebase/firestore';
import { useNotifications } from './notification-context';


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
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
}

const TimeTrackerContext = createContext<TimeTrackerContextType | undefined>(
  undefined
);

export const TimeTrackerProvider = ({ children }: { children: ReactNode }) => {
  const [time, setTime] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [activeTask, setActiveTask] = useState<string | null>(null);
  const [localTasks, setLocalTasks] = useState<Task[]>([]);
  const [isCompleteTaskOpen, setCompleteTaskOpen] = useState(false);
  const [isTaskDetailsOpen, setTaskDetailsOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  
  const { user: firebaseUser } = useUser();
  const firestore = useFirestore();
  const { addNotification } = useNotifications();

  const todosQuery = useMemo(() => {
    if (!firestore || !firebaseUser) return null;
    return query(collection(firestore, 'users', firebaseUser.uid, 'todos'), orderBy('createdAt', 'asc'));
  }, [firestore, firebaseUser]);

  const { data: firestoreTasks, loading: tasksLoading } = useCollection<Task>(todosQuery);
  const completedTasksCount = useMemo(() => localTasks.filter(t => t.status === 'Completed').length, [localTasks]);

  useEffect(() => {
    if (!tasksLoading && firestoreTasks) {
      setLocalTasks(firestoreTasks);
    }
  }, [firestoreTasks, tasksLoading]);
  
  useEffect(() => {
    const initiallyActiveTask = localTasks.find((t) => t.status === 'In Progress');
    if (initiallyActiveTask) {
      setActiveTask(initiallyActiveTask.id);
      setIsActive(true);
      if (initiallyActiveTask.startTime && (initiallyActiveTask.startTime as Timestamp).toDate) {
        const startTime = (initiallyActiveTask.startTime as Timestamp).toDate();
        const elapsedTime = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
        setTime(elapsedTime);
      } else {
        setTime(0);
      }
    } else {
      setIsActive(false);
      setActiveTask(null);
      setTime(0);
    }
  }, [localTasks]);

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

  // Notification for upcoming tasks
  useEffect(() => {
    const checkUpcomingTasks = () => {
        const now = new Date();
        localTasks.forEach(task => {
            if (task.status === 'Pending' && task.startTime && typeof task.startTime === 'string') {
                const [hours, minutes] = task.startTime.split(':').map(Number);
                const startTime = new Date(task.dueDate);
                startTime.setHours(hours, minutes);

                const minutesUntilStart = differenceInMinutes(startTime, now);

                if (minutesUntilStart > 0 && minutesUntilStart <= 15) {
                    addNotification({
                        type: 'task',
                        title: `Upcoming Task: ${task.name}`,
                        message: `Starts in ${minutesUntilStart} minutes.`,
                        link: '/projects'
                    });
                }
            }
        });
    };

    const intervalId = setInterval(checkUpcomingTasks, 60000); // Check every minute

    return () => clearInterval(intervalId);
}, [localTasks, addNotification]);

  const startTask = useCallback(async (taskId: string) => {
    if (!firestore || !firebaseUser) return;
    
    if (activeTask && activeTask !== taskId) {
      const currentActiveTask = localTasks.find(t => t.id === activeTask);
      if (currentActiveTask) {
        const taskDocRef = doc(firestore, 'users', firebaseUser.uid, 'todos', currentActiveTask.id);
        await updateDoc(taskDocRef, { status: 'Pending' });
      }
    }

    const taskToStart = localTasks.find(t => t.id === taskId);
    if (!taskToStart) return;

    const taskDocRef = doc(firestore, 'users', firebaseUser.uid, 'todos', taskId);
    await updateDoc(taskDocRef, { 
      status: 'In Progress',
      startTime: serverTimestamp() 
    }).catch(serverError => {
      if (serverError.code === 'permission-denied') {
        const permissionError = new FirestorePermissionError({
            path: taskDocRef.path,
            operation: 'update',
            requestResourceData: { status: 'In Progress', startTime: new Date().toISOString() },
        });
        errorEmitter.emit('permission-error', permissionError);
      }
    });

    setActiveTask(taskId);
    setTime(0);
    setIsActive(true);
  }, [firestore, firebaseUser, activeTask, localTasks]);

  const handleStop = useCallback(async (taskId: string, description: string) => {
    if (!firestore || !firebaseUser || !selectedTask) return;
    
    const taskDocRef = doc(firestore, 'users', firebaseUser.uid, 'todos', selectedTask.id);
    const endTime = serverTimestamp();
    
    await updateDoc(taskDocRef, {
      status: 'Completed',
      description,
      endTime,
      duration: time,
    }).catch(serverError => {
      if (serverError.code === 'permission-denied') {
        const permissionError = new FirestorePermissionError({
            path: taskDocRef.path,
            operation: 'update',
            requestResourceData: { status: 'Completed', description, endTime: new Date().toISOString(), duration: time },
        });
        errorEmitter.emit('permission-error', permissionError);
      }
    });

    setIsActive(false);
    setActiveTask(null);
    setTime(0);
    setSelectedTask(null);
  }, [firestore, firebaseUser, time, selectedTask]);


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
        if (serverError.code === 'permission-denied') {
            const permissionError = new FirestorePermissionError({
                path: todosCollection.path,
                operation: 'create',
                requestResourceData: newTaskData,
            });
            errorEmitter.emit('permission-error', permissionError);
        }
    });
  }, [firestore, firebaseUser, toast]);

  const updateTask = useCallback(async (task: Task) => {
    if (!firestore || !firebaseUser) return;
    const taskDocRef = doc(firestore, 'users', firebaseUser.uid, 'todos', task.id);
    const { id, ...taskData } = task;
    await updateDoc(taskDocRef, taskData).catch(serverError => {
        if (serverError.code === 'permission-denied') {
            const permissionError = new FirestorePermissionError({
                path: taskDocRef.path,
                operation: 'update',
                requestResourceData: taskData,
            });
            errorEmitter.emit('permission-error', permissionError);
        }
    });
  }, [firestore, firebaseUser]);


    const deleteTask = useCallback(async (taskId: string) => {
    if (!firestore || !firebaseUser) return;
    const taskDocRef = doc(firestore, 'users', firebaseUser.uid, 'todos', taskId);
    await deleteDoc(taskDocRef).catch(serverError => {
        if (serverError.code === 'permission-denied') {
            const permissionError = new FirestorePermissionError({
                path: taskDocRef.path,
                operation: 'delete',
            });
            errorEmitter.emit('permission-error', permissionError);
        }
    });
  }, [firestore, firebaseUser]);

    const handleStartStop = () => {
        if (isActive) {
            setIsActive(false); // Pause
        } else {
            if (activeTask) {
                setIsActive(true); // Resume
            } else {
                const firstPending = localTasks.find(t => t.status === 'Pending');
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
    tasks: localTasks,
    completedTasksCount,
    handleStartStop,
    handleReset,
    startTask,
    handleStop,
    deleteTask,
    addTask: (task: any) => {
      const formattedTask = {
        ...task,
        dueDate: format(task.dueDate as Date, 'yyyy-MM-dd'),
      };
      addTask(formattedTask as any);
    },
    updateTask: (task: any) => {
        const formattedTask = {
          ...task,
          dueDate: format(task.dueDate as Date, 'yyyy-MM-dd'),
        };
        updateTask(formattedTask as any);
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
