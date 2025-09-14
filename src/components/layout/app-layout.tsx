
'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { TimeTrackerProvider, useTimeTracker } from '@/context/time-tracker-context';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { Footer } from '../dashboard/footer';
import { ThemeProvider } from '@/context/theme-provider';
import { useIsMobile } from '@/hooks/use-mobile';
import { TimeTracker } from '../dashboard/time-tracker';
import { ReportsProvider } from '@/context/reports-context';

function LayoutWithTracker({ children }: { children: ReactNode }) {
    const { isActive } = useTimeTracker();
    const isMobile = useIsMobile();
    const pathname = usePathname();
    const isChatPage = pathname === '/chat';
  
    return (
      <div className="flex min-h-screen w-full bg-muted/40">
        <Sidebar />
        <div className="flex flex-1 flex-col md:pl-[220px] lg:pl-[280px] relative">
          <Header />
          <div className="flex-1 flex flex-col pb-16 md:pb-0">
            <div className="flex-1">{children}</div>
            {!isChatPage && <Footer />}
          </div>
          {isMobile && isActive && <TimeTracker isMobileFooter={true} />}
        </div>
      </div>
    );
  }

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <TimeTrackerProvider>
        <ReportsProvider>
          <LayoutWithTracker>{children}</LayoutWithTracker>
        </ReportsProvider>
      </TimeTrackerProvider>
    </ThemeProvider>
  );
}
