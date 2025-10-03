
'use client';

import { ReactNode, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { TimeTrackerProvider, useTimeTracker } from '@/context/time-tracker-context';
import { Sidebar, SidebarProvider, useSidebar } from './sidebar';
import { Header } from './header';
import { Footer } from '../dashboard/footer';
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
    const { open, setOpen } = useSidebar();
    
    const isChatPage = pathname === '/chat';
    const isMeetingPage = pathname.startsWith('/meetings/');
    const isLobbyPage = pathname.includes('/lobby');
    const isAdminPage = pathname === '/admin';

    useEffect(() => {
        if (isAdminPage) {
            setOpen(false);
        } else {
            // Check cookie for persisted state if not on admin page
            const cookieValue = document.cookie
                .split('; ')
                .find(row => row.startsWith('sidebar_state='))
                ?.split('=')[1];
            
            // Default to true (expanded) if no cookie is found
            const shouldBeOpen = cookieValue ? cookieValue === 'true' : true;
            setOpen(shouldBeOpen);
        }
    }, [pathname, setOpen, isAdminPage]);


    if (isLobbyPage || (isMeetingPage && !pathname.endsWith('/meetings'))) {
      return <>{children}</>;
    }
  
    return (
      <div className={cn("flex min-h-screen w-full bg-muted/40", isMeetingPage && 'flex-col')}>
        {!isMeetingPage && <Sidebar />}
        <div className={cn(
            "flex flex-1 flex-col relative transition-[padding-left] duration-300", 
            !isMeetingPage && open && "md:pl-[220px] lg:pl-[280px]",
            !isMeetingPage && !open && "md:pl-[72px] lg:pl-[72px]"
        )}>
          <Header />
          <div className="flex flex-1 flex-col">
            <main className="flex-1 flex flex-col">{children}</main>
            {!isChatPage && !isMeetingPage && <Footer />}
          </div>
          {isMobile && isActive && <TimeTracker isMobileFooter={true} />}
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
