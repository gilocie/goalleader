
'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

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
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>(defaultUser);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('userSettings');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to load user settings from localStorage", error);
    }
  }, []);

  const saveUser = (newUser: User) => {
     try {
        localStorage.setItem('userSettings', JSON.stringify(newUser));
        setUser(newUser);
        toast({
            title: 'Profile Updated',
            description: 'Your role and department have been updated.',
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

  const value = {
    user,
    setUser,
    saveUser,
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
