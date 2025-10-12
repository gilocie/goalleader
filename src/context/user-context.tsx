
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
  const { toast } = useToast();

  const usersQuery = React.useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'users');
  }, [firestore]);
  
  const { data: allTeamMembers, loading: usersLoading } = useCollection<TeamMember>(usersQuery);

  // This is a client-side mock for fetching all users with emails.
  // In a real app, this should be a secure backend/admin operation.
  const [allUsersWithAuth, setAllUsersWithAuth] = useState<User[]>([]);
  
  const loading = authLoading || usersLoading;

  useEffect(() => {
    if (!loading && firebaseUser && allTeamMembers.length > 0) {
      const currentUserData = allTeamMembers.find(member => member.id === firebaseUser.uid);
      if (currentUserData) {
        const currentUser: User = {
          id: firebaseUser.uid,
          name: currentUserData.name || firebaseUser.displayName || 'Anonymous',
          role: currentUserData.role || 'Consultant',
          department: currentUserData.department || 'Customer Service',
          country: currentUserData.country || '',
          branch: currentUserData.branch || '',
          email: firebaseUser.email || '',
          status: currentUserData.status || 'online',
        };
        setUser(currentUser);
        if (currentUser.status !== 'online') {
            updateUserStatus(firebaseUser.uid, 'online');
        }
      } else if (!usersLoading) { // Ensure we're not in a loading state
         // User is authenticated but has no profile, create a default one
         const newUserProfile: User = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || `User-${firebaseUser.uid.slice(0,5)}`,
            role: 'Consultant',
            department: 'Unassigned', // Start as unassigned
            country: '',
            branch: '',
            email: firebaseUser.email || '',
            status: 'online',
         };
         setUser(newUserProfile);
         // Save this new profile to Firestore
         saveUser(newUserProfile);
      }
    } else if (!loading && !firebaseUser) {
        setUser(null);
    }
  }, [firebaseUser, allTeamMembers, loading, usersLoading]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (firebaseUser) {
        updateUserStatus(firebaseUser.uid, new Date().toISOString());
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [firebaseUser]);


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
        
        toast({
            title: 'Profile Updated',
            description: `Your profile has been saved.`,
        });

        if (user?.id !== newUser.id) {
             setUser(newUser);
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
