
'use client';

import { ReactNode } from 'react';
import { TimeTrackerProvider } from '@/context/time-tracker-context';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { Footer } from '../dashboard/footer';
import { ThemeProvider } from '@/context/theme-provider';

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <TimeTrackerProvider>
        <div className="flex min-h-screen w-full bg-muted/40">
          <Sidebar />
          <div className="flex flex-1 flex-col md:pl-[220px] lg:pl-[280px] relative">
            <Header />
            {children}
            <Footer />
          </div>
        </div>
      </TimeTrackerProvider>
    </ThemeProvider>
  );
}
