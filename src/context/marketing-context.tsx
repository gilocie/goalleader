
'use client';

import React, { createContext, useState, useContext, ReactNode, useMemo, useCallback, useEffect } from 'react';
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
  services: string[];
  statuses: string[];
  addLead: (lead: Omit<Lead, 'id'>) => void;
  updateLead: (leadId: string, updates: Partial<Lead>) => void;
  deleteLead: (leadId: string) => void;
  approveContent: (content: Suggestion) => void;
  updateApprovedContent: (contentId: string, updates: Partial<MarketingContent>) => void;
  deleteApprovedContent: (contentId: string) => void;
  addService: (service: string) => void;
  updateService: (index: number, newService: string) => void;
  deleteService: (index: number) => void;
  addStatus: (status: string) => void;
  updateStatus: (index: number, newStatus: string) => void;
  deleteStatus: (index: number) => void;
}

const MarketingContext = createContext<MarketingContextType | undefined>(undefined);

const defaultServices = ["UX/UI Design", "Frontend Dev", "Backend Dev", "QA Testing", "Cloud Services"];
const defaultStatuses = ["New", "Contacted", "Qualified", "Proposal Sent", "Negotiation", "Won", "Lost"];

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
  
  const [services, setServices] = useState<string[]>(defaultServices);
  const [statuses, setStatuses] = useState<string[]>(defaultStatuses);
  
  useEffect(() => {
    try {
      const storedServices = localStorage.getItem('marketing_services');
      if (storedServices) setServices(JSON.parse(storedServices));
      const storedStatuses = localStorage.getItem('marketing_statuses');
      if (storedStatuses) setStatuses(JSON.parse(storedStatuses));
    } catch (error) {
        console.error("Failed to load marketing settings from localStorage", error);
    }
  }, []);

  const updateLocalStorage = (key: string, data: any) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error(`Failed to update ${key} in localStorage`, error);
    }
  };

  const addService = (service: string) => {
    const updated = [...services, service];
    setServices(updated);
    updateLocalStorage('marketing_services', updated);
  };

  const updateService = (index: number, newService: string) => {
    const updated = [...services];
    updated[index] = newService;
    setServices(updated);
    updateLocalStorage('marketing_services', updated);
  };

  const deleteService = (index: number) => {
    const updated = services.filter((_, i) => i !== index);
    setServices(updated);
    updateLocalStorage('marketing_services', updated);
  };

  const addStatus = (status: string) => {
    const updated = [...statuses, status];
    setStatuses(updated);
    updateLocalStorage('marketing_statuses', updated);
  };

  const updateStatus = (index: number, newStatus: string) => {
    const updated = [...statuses];
    updated[index] = newStatus;
    setStatuses(updated);
    updateLocalStorage('marketing_statuses', updated);
  };

  const deleteStatus = (index: number) => {
    const updated = statuses.filter((_, i) => i !== index);
    setStatuses(updated);
    updateLocalStorage('marketing_statuses', updated);
  };

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
    services,
    statuses,
    addLead,
    updateLead,
    deleteLead,
    approveContent,
    updateApprovedContent,
    deleteApprovedContent,
    addService,
    updateService,
    deleteService,
    addStatus,
    updateStatus,
    deleteStatus,
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
