
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
import { AISuggestionProvider } from '@/context/ai-suggestion-context';

function LayoutWithTracker({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const { open, setOpen } = useSidebar();
    
    const isChatPage = pathname === '/chat';
    const isMeetingPage = pathname.startsWith('/meetings/');
    const isLobbyPage = pathname.includes('/lobby');

    useEffect(() => {
        if (isChatPage) {
            setOpen(false);
        }
    }, [isChatPage, setOpen]);

    // Render children directly for special full-screen layouts
    if (isLobbyPage || (isMeetingPage && !pathname.endsWith('/meetings') && !isChatPage)) {
      return <>{children}</>;
    }
  
    return (
      <div className={cn("flex min-h-screen w-full bg-muted/40")}>
        <Sidebar />
        <div className={cn(
            "flex flex-1 flex-col transition-[margin-left] duration-300", 
            open && "md:ml-[220px] lg:ml-[280px]",
            !open && "md:ml-[72px] lg:ml-[72px]",
        )}>
          <Header />
          {/* 
            This is the main content area.
            - `flex-1` makes it fill the vertical space between header and footer.
            - `flex flex-col` allows its children to also use flex properties.
            - `overflow-hidden` is key to containing children and their scrollbars.
          */}
          <main className="flex-1 flex flex-col overflow-hidden">
            {children}
          </main>
          {/* Footer is only shown on specific pages */}
          {!isChatPage && !isMeetingPage && <Footer />}
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
              <AISuggestionProvider>
                <LayoutWithTracker>{children}</LayoutWithTracker>
              </AISuggestionProvider>
            </NotificationProvider>
          </ChatProvider>
        </ReportsProvider>
      </TimeTrackerProvider>
    </SidebarProvider>
  );
}
