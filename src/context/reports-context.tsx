
'use client';

import React, { createContext, useState, useContext, ReactNode, useMemo } from 'react';
import { useFirestore, useUser, useCollection } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export type Report = {
  id: string;
  title: string;
  content: string;
  date: string;
  userId: string;
};

interface ReportsContextType {
  reports: Report[];
  addReport: (report: Omit<Report, 'id' | 'date' | 'userId'>) => void;
}

const ReportsContext = createContext<ReportsContextType | undefined>(undefined);

export const ReportsProvider = ({ children }: { children: ReactNode }) => {
  const { user: firebaseUser } = useUser();
  const firestore = useFirestore();

  const reportsQuery = useMemo(() => {
    if (!firestore || !firebaseUser) return null;
    return query(collection(firestore, 'users', firebaseUser.uid, 'reports'), orderBy('date', 'desc'));
  }, [firestore, firebaseUser]);

  const { data: reports, loading: reportsLoading } = useCollection<Report>(reportsQuery);

  const addReport = (report: Omit<Report, 'id' | 'date' | 'userId'>) => {
    if (!firestore || !firebaseUser) return;

    const reportsCollection = collection(firestore, 'users', firebaseUser.uid, 'reports');
    const newReportData = {
      ...report,
      userId: firebaseUser.uid,
      date: new Date().toISOString(),
    };
    
    addDoc(reportsCollection, newReportData).catch(serverError => {
        const permissionError = new FirestorePermissionError({
            path: reportsCollection.path,
            operation: 'create',
            requestResourceData: newReportData,
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  };

  const value = {
    reports: reports || [],
    addReport,
  };

  return (
    <ReportsContext.Provider value={value}>{children}</ReportsContext.Provider>
  );
};

export const useReports = () => {
  const context = useContext(ReportsContext);
  if (context === undefined) {
    throw new Error('useReports must be used within a ReportsProvider');
  }
  return context;
};
