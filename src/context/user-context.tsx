
'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { allTeamMembers, TeamMember } from '@/lib/users';
import { useUser as useFirebaseAuthUser } from '@/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

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
  user: User | null;
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  saveUser: (user: User) => void;
  updateUserStatus: (userId: string, status: 'online' | string) => void;
  getUserStatus: (userId: string) => 'online' | string;
  allTeamMembers: TeamMember[];
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const USER_STATUS_KEY = 'user_statuses';

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { user: firebaseUser, loading: authLoading } = useFirebaseAuthUser();
  const firestore = useFirestore();
  const [user, setUser] = useState<User | null>(null);
  const [userStatuses, setUserStatuses] = useState<Record<string, 'online' | string>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (authLoading) {
        setLoading(true);
        return;
    }
    
    if (firebaseUser && firestore) {
        const userDocRef = doc(firestore, 'users', firebaseUser.uid);
        const unsubscribe = onSnapshot(userDocRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                setUser({
                    id: firebaseUser.uid,
                    name: data.name || firebaseUser.displayName || 'Anonymous',
                    role: data.role || 'Consultant',
                    department: data.department || 'Customer Service',
                });
            } else {
                 // If no user profile in Firestore, create a default one
                 const newUserProfile: User = {
                    id: firebaseUser.uid,
                    name: firebaseUser.displayName || `User-${firebaseUser.uid.slice(0,5)}`,
                    role: 'Consultant',
                    department: 'Customer Service',
                 };
                 setUser(newUserProfile);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    } else {
        setUser(null);
        setLoading(false);
    }
  }, [firebaseUser, firestore, authLoading]);

  useEffect(() => {
    try {
      const storedStatuses = localStorage.getItem(USER_STATUS_KEY);
      if (storedStatuses) {
        setUserStatuses(JSON.parse(storedStatuses));
      }
    } catch (error) {
      console.error("Failed to load user statuses from localStorage", error);
    }
  }, []);

  const saveUser = (newUser: User) => {
     try {
        // This function is now mostly for local profile switching simulation
        if (user) {
          updateUserStatus(user.id, `last seen ${format(new Date(), "p 'on' MMM d")}`);
        }
        
        localStorage.setItem('userSettings', JSON.stringify(newUser)); // This might be used for theme etc, but not auth user
        setUser(newUser);
        
        updateUserStatus(newUser.id, 'online');

        toast({
            title: 'Profile Switched (Simulation)',
            description: `You are now viewing as ${newUser.name}. To truly switch accounts, please log out and log in.`,
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
    loading,
    setUser,
    saveUser,
    updateUserStatus,
    getUserStatus,
    allTeamMembers,
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
