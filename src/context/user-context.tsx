
'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { TeamMember } from '@/lib/users';
import { useUser as useFirebaseAuthUser, useCollection } from '@/firebase';
import { doc, onSnapshot, collection, updateDoc, setDoc, getDocs } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { getAuth, User as FirebaseAuthUser } from 'firebase/auth';
import { FirebaseApp } from 'firebase/app';
import { listUsers } from 'firebase/auth'; // This is admin-only, can't use on client

export type UserRole = 'Admin' | 'Team Leader' | 'Consultant' | 'Frontend Developer' | 'Backend Developer' | 'QA Engineer' | 'Marketing Specialist' | 'Content Creator' | 'IT Support';

interface User {
  id: string;
  name: string;
  role: UserRole;
  department: string;
  country?: string;
  branch?: string;
  email?: string;
  status: 'online' | string;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  saveUser: (user: User) => void;
  updateUserStatus: (userId: string, status: 'online' | string) => void;
  getUserStatus: (userId: string) => 'online' | string;
  allTeamMembers: TeamMember[];
  allUsersWithAuth: User[];
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { user: firebaseUser, loading: authLoading } = useFirebaseAuthUser();
  const firestore = useFirestore();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const usersQuery = React.useMemo(() => {
    // Only run the query if the user is authenticated and firestore is available
    if (!firestore) return null; // Fetch all users regardless of auth state to get statuses
    return collection(firestore, 'users');
  }, [firestore]);
  
  const { data: allTeamMembers, loading: usersLoading } = useCollection<TeamMember>(usersQuery);

  // This is a client-side mock for fetching all users with emails.
  // In a real app, this should be a secure backend/admin operation.
  const [allUsersWithAuth, setAllUsersWithAuth] = useState<User[]>([]);

  useEffect(() => {
    if (authLoading || usersLoading) {
        setLoading(true);
        return;
    }
    
    if (firebaseUser && firestore) {
        updateUserStatus(firebaseUser.uid, 'online');
        const userDocRef = doc(firestore, 'users', firebaseUser.uid);
        const unsubscribe = onSnapshot(userDocRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                setUser({
                    id: firebaseUser.uid,
                    name: data.name || firebaseUser.displayName || 'Anonymous',
                    role: data.role || 'Consultant',
                    department: data.department || 'Customer Service',
                    country: data.country || '',
                    branch: data.branch || '',
                    email: firebaseUser.email || '',
                    status: data.status || 'online',
                });
            } else {
                 const newUserProfile: User = {
                    id: firebaseUser.uid,
                    name: firebaseUser.displayName || `User-${firebaseUser.uid.slice(0,5)}`,
                    role: 'Consultant',
                    department: 'Customer Service',
                    country: '',
                    branch: '',
                    email: firebaseUser.email || '',
                    status: 'online',
                 };
                 setUser(newUserProfile);
            }
            setLoading(false);
        });

        const handleBeforeUnload = () => {
          updateUserStatus(firebaseUser.uid, new Date().toISOString());
        };
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
          if (firebaseUser) {
            updateUserStatus(firebaseUser.uid, new Date().toISOString());
          }
          window.removeEventListener('beforeunload', handleBeforeUnload);
          unsubscribe();
        };
    } else {
        setUser(null);
        setLoading(false);
    }
  }, [firebaseUser, firestore, authLoading, usersLoading]);

  // Mock fetching all users with emails
  useEffect(() => {
      if (allTeamMembers && firebaseUser) {
          const combined = allTeamMembers.map(member => {
              // Show real email for current user, mock for others
              const email = member.id === firebaseUser.uid
                  ? firebaseUser.email
                  : `${member.name.toLowerCase().replace(/\s/g, '.')}@goalleader.com`;
              return { ...member, email: email || '', status: member.status || 'offline' };
          });
          setAllUsersWithAuth(combined);
      } else if (allTeamMembers) {
         setAllUsersWithAuth(allTeamMembers.map(m => ({ ...m, email: `${m.name.toLowerCase().replace(/\s/g, '.')}@goalleader.com`, status: m.status || 'offline' })));
      }
  }, [allTeamMembers, firebaseUser]);

  const saveUser = (newUser: User) => {
     try {
        if (firestore) {
          const { email, ...firestoreData } = newUser; // Don't save email to Firestore profile
          const userDocRef = doc(firestore, 'users', newUser.id);
          setDoc(userDocRef, firestoreData, { merge: true }).catch(serverError => {
            const permissionError = new FirestorePermissionError({
                path: userDocRef.path,
                operation: 'update',
                requestResourceData: firestoreData,
            });
            errorEmitter.emit('permission-error', permissionError);
          });
        }
        
        localStorage.setItem('simulatedUserId', newUser.id);
        
        toast({
            title: 'Profile Updated',
            description: `Your profile has been saved.`,
        });

        if (user?.id !== newUser.id) {
            window.location.reload();
        } else {
            setUser(newUser);
        }

     } catch (error) {
        console.error("Failed to save user settings", error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not save profile.',
        });
     }
  };
  
  const updateUserStatus = (userId: string, status: 'online' | string) => {
    if (!firestore) return;
    const userDocRef = doc(firestore, 'users', userId);
    updateDoc(userDocRef, { status }).catch(serverError => {
        // We don't want to show an error for this as it's a background task
        console.error("Could not update user status:", serverError);
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
    allUsersWithAuth: allUsersWithAuth || [],
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
