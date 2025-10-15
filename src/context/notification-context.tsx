
'use client';

import React, { createContext, useState, useContext, ReactNode, useCallback, useRef, useEffect } from 'react';
import { Bot, Check, FileText, MessageSquare, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface Notification {
  id: string;
  type: 'ai' | 'chat' | 'task' | 'report' | 'staff';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
  author?: string;
}

const initialNotifications: Notification[] = [
    {
        id: '1',
        type: 'ai',
        title: 'Performance Insight',
        message: 'Your task completion rate is up 15% this week! Keep up the great work.',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        read: false,
        author: 'GoalLeader AI',
        link: '/performance'
    },
    {
        id: '2',
        type: 'task',
        title: 'Task Completed',
        message: '"Design new landing page" has been marked as complete.',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        read: false,
        author: 'You',
        link: '/tasks'
    },
    {
        id: '3',
        type: 'staff',
        title: 'New Company Policy',
        message: 'All employees are required to complete the new security training by the end of the month.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        read: true,
        author: 'HR Department',
        link: '/notices'
    },
];


interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'> & { reportContent?: string }) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotifications: (ids: string[]) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const { toast } = useToast();
  const notificationAudioRef = useRef<HTMLAudioElement | null>(null);

useEffect(() => {
  if (typeof window === 'undefined') return;

  const audio = new Audio('/sounds/notifications-tones/default.mp3');
  audio.preload = 'auto';

  // Keep the ref
  notificationAudioRef.current = audio;

  // Load manually to ensure timing
  const handleCanPlay = () => {
    console.log('[Audio] ✓ Notification sound ready');
  };

  const handleError = (e: any) => {
    console.error('[Audio] ❌ Failed to load notification sound:', e);
    console.warn('Make sure the file exists at /sounds/notifications-tones/default.mp3');
  };

  audio.addEventListener('canplaythrough', handleCanPlay, { once: true });
  audio.addEventListener('error', handleError, { once: true });
  audio.load();

  return () => {
    audio.pause();
    audio.src = '';
    audio.load();
    audio.removeEventListener('canplaythrough', handleCanPlay);
    audio.removeEventListener('error', handleError);
  };
}, []);

const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'> & { reportContent?: string }) => {
  const { reportContent, ...rest } = notification;
  
  let link = notification.link;
  if (reportContent && link) {
    link = `${link}?reportContent=${encodeURIComponent(reportContent)}`;
  }
  
  const newNotification: Notification = {
    ...rest,
    id: new Date().toISOString() + Math.random(),
    timestamp: new Date().toISOString(),
    read: false,
    link: link
  };
  setNotifications(prev => [newNotification, ...prev]);

  // Play sound
  if (notificationAudioRef.current) {
    const audio = notificationAudioRef.current;
    audio.pause();
    audio.currentTime = 0;
  
    audio.play()
      .then(() => console.log('[Audio] ✓ Notification sound played'))
      .catch(err => {
        console.warn('[Audio] ⚠️ Playback blocked or failed:', err.name);
      });
  }

  toast({
    title: notification.title,
    description: <p className='line-clamp-2'>{notification.message}</p>
  });
}, [toast]);

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotifications = (ids: string[]) => {
    setNotifications(prev => prev.filter(n => !ids.includes(n.id)));
  };

  const value = {
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
        case 'ai': return <Bot className="h-5 w-5 text-primary" />;
        case 'task': return <Check className="h-5 w-5 text-green-500" />;
        case 'report': return <FileText className="h-5 w-5 text-blue-500" />;
        case 'chat': return <MessageSquare className="h-5 w-5 text-purple-500" />;
        case 'staff': return <User className="h-5 w-5 text-orange-500" />;
        default: return <Bot className="h-5 w-5 text-primary" />;
    }
};
