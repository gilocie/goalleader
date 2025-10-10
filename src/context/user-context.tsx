

'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export type UserRole = 'Admin' | 'Team Leader' | 'Consultant' | 'Frontend Developer' | 'Backend Developer' | 'QA Engineer' | 'Marketing Specialist' | 'Content Creator' | 'IT Support';

interface User {
  id: string;
  name: string;
  role: UserRole;
  department: string;
}

const defaultUser: User = {
  id: 'patrick-achitabwino-m1',
  name: 'Patrick Achitabwino',
  role: 'Consultant',
  department: 'Customer Service',
};

interface UserContextType {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  saveUser: (user: User) => void;
  updateUserStatus: (userId: string, status: 'online' | string) => void;
  getUserStatus: (userId: string) => 'online' | string;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const USER_STATUS_KEY = 'user_statuses';

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>(defaultUser);
  const [userStatuses, setUserStatuses] = useState<Record<string, 'online' | string>>({});
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('userSettings');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        updateUserStatus(parsedUser.id, 'online');
      } else {
        updateUserStatus(defaultUser.id, 'online');
      }

      const storedStatuses = localStorage.getItem(USER_STATUS_KEY);
      if (storedStatuses) {
        setUserStatuses(JSON.parse(storedStatuses));
      }
    } catch (error) {
      console.error("Failed to load user data from localStorage", error);
    }
  }, []);

  const saveUser = (newUser: User) => {
     try {
        // Set previous user's status to offline
        updateUserStatus(user.id, `last seen ${format(new Date(), "p 'on' MMM d")}`);
        
        localStorage.setItem('userSettings', JSON.stringify(newUser));
        setUser(newUser);
        
        // Set new user's status to online
        updateUserStatus(newUser.id, 'online');

        toast({
            title: 'Profile Switched',
            description: `You are now acting as ${newUser.name}.`,
        });
     } catch (error) {
        console.error("Failed to save user settings to localStorage", error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not save your profile changes.',
        });
     }
  };
  
  const updateUserStatus = (userId: string, status: 'online' | string) => {
    setUserStatuses(prev => {
        const newStatuses = { ...prev, [userId]: status };
        try {
            localStorage.setItem(USER_STATUS_KEY, JSON.stringify(newStatuses));
        } catch (e) {
            console.error("Failed to save user statuses", e);
        }
        return newStatuses;
    });
  };

  const getUserStatus = (userId: string): 'online' | string => {
    return userStatuses[userId] || 'offline';
  };


  const value = {
    user,
    setUser,
    saveUser,
    updateUserStatus,
    getUserStatus,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
