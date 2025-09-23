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
import { cn } from '@/lib/utils';
import { NotificationProvider } from '@/context/notification-context';
import { ChatProvider } from '@/context/chat-context';

function LayoutWithTracker({ children }: { children: ReactNode }) {
    const { isActive } = useTimeTracker();
    const isMobile = useIsMobile();
    const pathname = usePathname();
    const isChatPage = pathname === '/chat';
    const isMeetingPage = pathname.startsWith('/meetings/');
    const isLobbyPage = pathname.includes('/lobby');

    if (isLobbyPage || (isMeetingPage && !pathname.endsWith('/meetings'))) {
      return <>{children}</>;
    }
  
    return (
      <div className={cn(
          "flex min-h-screen w-full bg-muted/40",
      )}>
        {!isChatPage && <Sidebar />}
        <div className={cn(
            "flex flex-1 flex-col relative", 
            !isChatPage && "md:pl-[220px] lg:pl-[280px]"
        )}>
          {!isChatPage && <Header />}
          <div className="flex flex-1 flex-col overflow-hidden">
            <main className="flex-1 flex flex-col">{children}</main>
            {!isChatPage && !isMeetingPage && <Footer />}
          </div>
          {isMobile && isActive && <TimeTracker isMobileFooter={true} />}
        </div>
      </div>
    );
  }

export function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isChatPage = pathname === '/chat';
  
  return (
    <ThemeProvider>
      <TimeTrackerProvider>
        <ReportsProvider>
            <ChatProvider>
                <NotificationProvider>
                  {isChatPage ? (
                    <div className="flex min-h-screen w-full bg-muted/40">
                      {children}
                    </div>
                  ) : (
                    <LayoutWithTracker>{children}</LayoutWithTracker>
                  )}
                </NotificationProvider>
            </ChatProvider>
        </ReportsProvider>
      </TimeTrackerProvider>
    </ThemeProvider>
  );
}
