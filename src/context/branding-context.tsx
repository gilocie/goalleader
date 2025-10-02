
'use client';

import { useToast } from '@/hooks/use-toast';
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

// --- Types and Defaults ---
type BrandingState = {
  companyName: string;
  primaryColor: string;
  backgroundColor: string;
  accentColor: string;
  gradientEndColor: string;
};

const defaultBranding: BrandingState = {
  companyName: 'GoalLeader',
  primaryColor: '#27AE60',
  backgroundColor: '#F7FAFC',
  accentColor: '#90EE90',
  gradientEndColor: '#1E8449'
};

interface BrandingContextType {
  branding: BrandingState;
  setBranding: React.Dispatch<React.SetStateAction<BrandingState>>;
  saveBranding: (newBranding: BrandingState) => void;
  resetBranding: () => void;
}

// --- Context Definition ---
const BrandingContext = createContext<BrandingContextType | undefined>(undefined);


// --- Helper Functions ---
function hexToHsl(hex: string): [number, number, number] | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

// --- BrandingStyle Component ---
const BrandingStyle = () => {
    const { branding } = useBranding();
  
    useEffect(() => {
        const primaryHsl = hexToHsl(branding.primaryColor);
        const backgroundHsl = hexToHsl(branding.backgroundColor);
        const accentHsl = hexToHsl(branding.accentColor);
        const gradientEndHsl = hexToHsl(branding.gradientEndColor);

        if (primaryHsl && backgroundHsl && accentHsl && gradientEndHsl) {
            const root = document.documentElement;
            root.style.setProperty('--primary', `${primaryHsl[0]} ${primaryHsl[1]}% ${primaryHsl[2]}%`);
            root.style.setProperty('--background', `${backgroundHsl[0]} ${backgroundHsl[1]}% ${backgroundHsl[2]}%`);
            root.style.setProperty('--accent', `${accentHsl[0]} ${accentHsl[1]}% ${accentHsl[2]}%`);
            root.style.setProperty('--primary-dark', `${gradientEndHsl[0]} ${gradientEndHsl[1]}% ${gradientEndHsl[2]}%`);
        }
    }, [branding]);
  
    return null;
  };

// --- Provider Component ---
export const BrandingProvider = ({ children }: { children: ReactNode }) => {
  const [branding, setBranding] = useState<BrandingState>(defaultBranding);
  const { toast } = useToast();

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
        <BrandingStyle />
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
