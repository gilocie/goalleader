
'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { TeamMember } from '@/lib/users';
import { useUser as useFirebaseAuthUser, useCollection } from '@/firebase';
import { doc, onSnapshot, collection, updateDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export type UserRole = 'Admin' | 'Team Leader' | 'Consultant' | 'Frontend Developer' | 'Backend Developer' | 'QA Engineer' | 'Marketing Specialist' | 'Content Creator' | 'IT Support';

interface User {
  id: string;
  name: string;
  role: UserRole;
  department: string;
}

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

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { user: firebaseUser, loading: authLoading } = useFirebaseAuthUser();
  const firestore = useFirestore();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const usersQuery = React.useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'users');
  }, [firestore]);
  
  const { data: allTeamMembers, loading: usersLoading } = useCollection<TeamMember>(usersQuery);

  useEffect(() => {
    if (authLoading || usersLoading) {
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
  }, [firebaseUser, firestore, authLoading, usersLoading]);

  const saveUser = (newUser: User) => {
     try {
        if (user && firestore) {
          const oldUserDocRef = doc(firestore, 'users', user.id);
          updateDoc(oldUserDocRef, { status: `last seen ${format(new Date(), "p 'on' MMM d")}`});
        }
        
        // This is a client-side simulation for switching views.
        // It does not perform a real authentication change.
        localStorage.setItem('simulatedUserId', newUser.id);
        
        if (firestore) {
          const newUserDocRef = doc(firestore, 'users', newUser.id);
          updateDoc(newUserDocRef, { status: 'online' });
        }

        toast({
            title: 'Profile Switched',
            description: `You are now viewing as ${newUser.name}.`,
        });
        window.location.reload();
     } catch (error) {
        console.error("Failed to save user settings to localStorage", error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not switch profiles.',
        });
     }
  };
  
  const updateUserStatus = (userId: string, status: 'online' | string) => {
    if (!firestore) return;
    const userDocRef = doc(firestore, 'users', userId);
    updateDoc(userDocRef, { status }).catch(serverError => {
        const permissionError = new FirestorePermissionError({
            path: userDocRef.path,
            operation: 'update',
            requestResourceData: { status }
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  };

  const getUserStatus = (userId: string): 'online' | string => {
    const member = allTeamMembers.find(m => m.id === userId);
    return member?.status || 'offline';
  };


  const value = {
    user,
    loading,
    setUser,
    saveUser,
    updateUserStatus,
    getUserStatus,
    allTeamMembers: allTeamMembers || [],
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
