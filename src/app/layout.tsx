
'use client';

import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from '@/context/theme-provider';
import { BrandingProvider } from '@/context/branding-context';
import { useEffect } from 'react';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { UserProvider } from '@/context/user-context';
import { SidebarProvider } from '@/components/layout/sidebar';
import { NotificationProvider } from '@/context/notification-context';
import { ReportsProvider } from '@/context/reports-context';
import { ChatProvider } from '@/context/chat-context';
import { AISuggestionProvider } from '@/context/ai-suggestion-context';
import { MarketingProvider } from '@/context/marketing-context';
import { TimeTrackerProvider } from '@/context/time-tracker-context';

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

const BrandingInitializer = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    try {
      const storedBranding = localStorage.getItem('brandingSettings');
      if (storedBranding) {
        const branding = JSON.parse(storedBranding);
        const root = document.documentElement;
        
        const primaryHsl = hexToHsl(branding.primaryColor);
        const backgroundHsl = hexToHsl(branding.backgroundColor);
        const accentHsl = hexToHsl(branding.accentColor);

        if (primaryHsl) root.style.setProperty('--primary', primaryHsl[0] + ' ' + primaryHsl[1] + '% ' + primaryHsl[2] + '%');
        if (backgroundHsl) root.style.setProperty('--background', backgroundHsl[0] + ' ' + backgroundHsl[1] + '% ' + backgroundHsl[2] + '%');
        if (accentHsl) root.style.setProperty('--accent', accentHsl[0] + ' ' + accentHsl[1] + '% ' + accentHsl[2] + '%');
      }
    } catch (e) {
      console.error("Failed to apply initial branding styles:", e);
    }
  }, []);

  return <>{children}</>;
};

// This can't be a separate metadata export due to 'use client'
// export const metadata: Metadata = {
//   title: 'GoalLeader Dashboard',
//   description: 'Productivity and project management dashboard.',
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>GoalLeader Dashboard</title>
        <meta name="description" content="Productivity and project management dashboard." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider>
          <BrandingProvider>
            <FirebaseClientProvider>
                <UserProvider>
                    <SidebarProvider>
                        <NotificationProvider>
                            <ReportsProvider>
                                <ChatProvider>
                                    <AISuggestionProvider>
                                        <MarketingProvider>
                                            <TimeTrackerProvider>
                                                <BrandingInitializer>
                                                    {children}
                                                    <Toaster />
                                                </BrandingInitializer>
                                            </TimeTrackerProvider>
                                        </MarketingProvider>
                                    </AISuggestionProvider>
                                </ChatProvider>
                            </ReportsProvider>
                        </NotificationProvider>
                    </SidebarProvider>
                </UserProvider>
            </FirebaseClientProvider>
          </BrandingProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
