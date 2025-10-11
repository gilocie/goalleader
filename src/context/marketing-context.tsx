
'use client';

import React, { createContext, useState, useContext, ReactNode, useMemo, useCallback } from 'react';
import { useFirestore, useUser, useCollection } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import type { Lead } from '@/lib/client-leads';
import type { Suggestion } from '@/types/marketing';
import { useToast } from '@/hooks/use-toast';

export type MarketingContent = Suggestion & { id?: string; approvedAt: string };

interface MarketingContextType {
  leads: Lead[];
  approvedContent: MarketingContent[];
  loading: boolean;
  addLead: (lead: Omit<Lead, 'id'>) => void;
  updateLead: (leadId: string, updates: Partial<Lead>) => void;
  deleteLead: (leadId: string) => void;
  approveContent: (content: Suggestion) => void;
  updateApprovedContent: (contentId: string, updates: Partial<MarketingContent>) => void;
  deleteApprovedContent: (contentId: string) => void;
}

const MarketingContext = createContext<MarketingContextType | undefined>(undefined);

export const MarketingProvider = ({ children }: { children: ReactNode }) => {
  const { user: firebaseUser } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const leadsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'clientLeads'), orderBy('name', 'asc'));
  }, [firestore]);

  const marketingContentQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'marketingContent'), orderBy('approvedAt', 'desc'));
  }, [firestore]);

  const { data: leads, loading: leadsLoading } = useCollection<Lead>(leadsQuery);
  const { data: approvedContent, loading: contentLoading } = useCollection<MarketingContent>(marketingContentQuery);

  const loading = leadsLoading || contentLoading;

  const addLead = useCallback((lead: Omit<Lead, 'id'>) => {
    if (!firestore) return;
    const leadsCollection = collection(firestore, 'clientLeads');
    addDoc(leadsCollection, lead).catch(serverError => {
      const permissionError = new FirestorePermissionError({
        path: leadsCollection.path,
        operation: 'create',
        requestResourceData: lead,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  }, [firestore]);

  const updateLead = useCallback((leadId: string, updates: Partial<Lead>) => {
    if (!firestore) return;
    const leadDocRef = doc(firestore, 'clientLeads', leadId);
    updateDoc(leadDocRef, updates).catch(serverError => {
      const permissionError = new FirestorePermissionError({
        path: leadDocRef.path,
        operation: 'update',
        requestResourceData: updates,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  }, [firestore]);

  const deleteLead = useCallback((leadId: string) => {
    if (!firestore) return;
    const leadDocRef = doc(firestore, 'clientLeads', leadId);
    deleteDoc(leadDocRef).catch(serverError => {
      const permissionError = new FirestorePermissionError({
        path: leadDocRef.path,
        operation: 'delete',
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  }, [firestore]);

  const approveContent = useCallback((content: Suggestion) => {
    if (!firestore) return;
    const marketingContentCollection = collection(firestore, 'marketingContent');
    const newContent: Omit<MarketingContent, 'id'> = {
      ...content,
      approvedAt: new Date().toISOString(),
    };
    addDoc(marketingContentCollection, newContent).then(() => {
        toast({ title: 'Content Approved', description: `"${content.blogTitle}" is now available in Campaign Ads.` });
    }).catch(serverError => {
      const permissionError = new FirestorePermissionError({
        path: marketingContentCollection.path,
        operation: 'create',
        requestResourceData: newContent,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  }, [firestore, toast]);

  const updateApprovedContent = useCallback((contentId: string, updates: Partial<MarketingContent>) => {
    if (!firestore) return;
    const contentDocRef = doc(firestore, 'marketingContent', contentId);
    updateDoc(contentDocRef, updates).catch(serverError => {
      const permissionError = new FirestorePermissionError({
        path: contentDocRef.path,
        operation: 'update',
        requestResourceData: updates,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  }, [firestore]);

  const deleteApprovedContent = useCallback((contentId: string) => {
    if (!firestore) return;
    const contentDocRef = doc(firestore, 'marketingContent', contentId);
    deleteDoc(contentDocRef).catch(serverError => {
      const permissionError = new FirestorePermissionError({
        path: contentDocRef.path,
        operation: 'delete',
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  }, [firestore]);

  const value = {
    leads: leads || [],
    approvedContent: approvedContent || [],
    loading,
    addLead,
    updateLead,
    deleteLead,
    approveContent,
    updateApprovedContent,
    deleteApprovedContent,
  };

  return (
    <MarketingContext.Provider value={value}>{children}</MarketingContext.Provider>
  );
};

export const useMarketing = () => {
  const context = useContext(MarketingContext);
  if (context === undefined) {
    throw new Error('useMarketing must be used within a MarketingProvider');
  }
  return context;
};
