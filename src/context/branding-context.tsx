
'use client';

import { useToast } from '@/hooks/use-toast';
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

// --- Types and Defaults ---
type BrandingState = {
  companyName: string;
  primaryColor: string;
  backgroundColor: string;
  accentColor: string;
};

const defaultBranding: BrandingState = {
  companyName: 'GoalLeader',
  primaryColor: '#27AE60',
  backgroundColor: '#F7FAFC',
  accentColor: '#90EE90',
};

interface BrandingContextType {
  branding: BrandingState;
  setBranding: React.Dispatch<React.SetStateAction<BrandingState>>;
  saveBranding: (newBranding: BrandingState) => void;
  resetBranding: () => void;
}

// --- Context Definition ---
const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

// --- Provider Component ---
export const BrandingProvider = ({ children }: { children: ReactNode }) => {
  const [branding, setBranding] = useState<BrandingState>(defaultBranding);
  const { toast } = useToast();

  // Load branding from localStorage on mount
  useEffect(() => {
    try {
        const storedBranding = localStorage.getItem('brandingSettings');
        if (storedBranding) {
            setBranding(JSON.parse(storedBranding));
        }
    } catch (error) {
        console.error("Failed to load branding settings from localStorage", error);
    }
  }, []);

  const saveBranding = (newBranding: BrandingState) => {
    try {
        localStorage.setItem('brandingSettings', JSON.stringify(newBranding));
        setBranding(newBranding);
        toast({
            title: 'Branding Saved',
            description: 'Your new branding settings have been applied.',
        });
        window.location.reload();
    } catch (error) {
        console.error("Failed to save branding settings to localStorage", error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not save branding settings.',
        });
    }
  };

  const resetBranding = () => {
    try {
        localStorage.removeItem('brandingSettings');
        setBranding(defaultBranding);
        toast({
            title: 'Branding Reset',
            description: 'Branding has been reset to default values.',
        });
        window.location.reload();
    } catch (error) {
        console.error("Failed to reset branding settings", error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not reset branding settings.',
        });
    }
  };

  const value = {
    branding,
    setBranding,
    saveBranding,
    resetBranding,
  };

  return (
    <BrandingContext.Provider value={value}>
        {children}
    </BrandingContext.Provider>
  );
};

// --- Hook ---
export const useBranding = () => {
  const context = useContext(BrandingContext);
  if (context === undefined) {
    throw new Error('useBranding must be used within a BrandingProvider');
  }
  return context;
};
