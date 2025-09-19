
'use client';

import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { Bot, Check, FileText, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface Notification {
  id: string;
  type: 'ai' | 'chat' | 'task' | 'report';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
}

const initialNotifications: Notification[] = [
    {
        id: '1',
        type: 'ai',
        title: 'Performance Insight',
        message: 'Your task completion rate is up 15% this week! Keep up the great work.',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        read: false,
    },
    {
        id: '2',
        type: 'task',
        title: 'Task Completed',
        message: '"Design new landing page" has been marked as complete.',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        read: false,
    },
    {
        id: '3',
        type: 'chat',
        title: 'New Message',
        message: 'From Frank Mhango: "Can you review the latest designs?"',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        read: true,
    },
];


interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const { toast } = useToast();

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: new Date().toISOString() + Math.random(),
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev]);

    // Show a toast
    toast({
        title: notification.title,
        description: <p className='line-clamp-2'>{notification.message}</p>
    })
  }, [toast]);

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const value = {
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
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
        default: return <Bot className="h-5 w-5 text-primary" />;
    }
};
