
'use client';

import { ReactNode, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { TimeTrackerProvider, useTimeTracker } from '@/context/time-tracker-context';
import { Sidebar, SidebarProvider, useSidebar } from './sidebar';
import { Header } from './header';
import { Footer } from '../dashboard/footer';
import { useIsMobile } from '@/hooks/use-mobile';
import { ReportsProvider } from '@/context/reports-context';
import { cn } from '@/lib/utils';
import { NotificationProvider } from '@/context/notification-context';
import { ChatProvider } from '@/context/chat-context';

function LayoutWithTracker({ children }: { children: ReactNode }) {
    const { isActive } = useTimeTracker();
    const isMobile = useIsMobile();
    const pathname = usePathname();
    const { open, setOpen } = useSidebar();
    
    const isChatPage = pathname === '/chat';
    const isMeetingPage = pathname.startsWith('/meetings/');
    const isLobbyPage = pathname.includes('/lobby');
    const isAdminPage = pathname === '/admin';

    useEffect(() => {
        if (isChatPage) {
            setOpen(false);
        }
    }, [isChatPage, setOpen]);

    if (isLobbyPage || (isMeetingPage && !pathname.endsWith('/meetings'))) {
      return <>{children}</>;
    }
  
    return (
      <div className={cn("flex min-h-screen w-full bg-muted/40", isMeetingPage && 'flex-col')}>
        <Sidebar />
        <div className={cn(
            "flex flex-1 flex-col relative transition-[padding-left] duration-300", 
            open && "md:pl-[220px] lg:pl-[280px]",
            !open && "md:pl-[72px] lg:pl-[72px]",
        )}>
          <Header />
          <div className="flex flex-1 flex-col">
            <main className="flex-1 flex flex-col">{children}</main>
            {!isChatPage && !isMeetingPage && <Footer />}
          </div>
        </div>
      </div>
    );
  }

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
        <TimeTrackerProvider>
            <ReportsProvider>
                <ChatProvider>
                    <NotificationProvider>
                        <LayoutWithTracker>{children}</LayoutWithTracker>
                    </NotificationProvider>
                </ChatProvider>
            </ReportsProvider>
        </TimeTrackerProvider>
    </SidebarProvider>
  );
}
