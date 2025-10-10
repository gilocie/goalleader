
'use client';

import { ReactNode, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { TimeTrackerProvider } from '@/context/time-tracker-context';
import { Sidebar, SidebarProvider, useSidebar } from './sidebar';
import { Header } from './header';
import { Footer } from '../dashboard/footer';
import { ReportsProvider } from '@/context/reports-context';
import { cn } from '@/lib/utils';
import { NotificationProvider } from '@/context/notification-context';
import { ChatProvider } from '@/context/chat-context';
import { AISuggestionProvider } from '@/context/ai-suggestion-context';
import { UserProvider, useUser } from '@/context/user-context';
import { Skeleton } from '../ui/skeleton';

function LayoutWithTracker({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { open, setOpen } = useSidebar();
    const { user, loading } = useUser();
    
    const isChatPage = pathname === '/chat';
    const isMeetingPage = pathname.startsWith('/meetings/');
    const isLobbyPage = pathname.includes('/lobby');

    useEffect(() => {
        if (isChatPage) {
            setOpen(false);
        }
    }, [isChatPage, setOpen]);
    
    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);


    // Render children directly for special full-screen layouts
    if (isLobbyPage || (isMeetingPage && !pathname.endsWith('/meetings') && !isChatPage)) {
      return <>{children}</>;
    }

    if (loading || !user) {
        return (
            <div className="flex min-h-screen w-full bg-muted/40">
                <div className={cn("hidden md:flex md:flex-col border-r bg-card transition-all duration-300 md:w-[220px] lg:w-[280px]")}>
                    <div className='flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6'>
                        <Skeleton className='h-6 w-32' />
                    </div>
                    <div className='flex-1 p-4 space-y-2'>
                        {[...Array(6)].map((_,i) => <Skeleton key={i} className='h-10 w-full' />)}
                    </div>
                </div>
                 <div className="flex flex-1 flex-col">
                    <div className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6 justify-between">
                        <Skeleton className='h-8 w-8 md:hidden' />
                        <Skeleton className='h-8 w-40' />
                        <Skeleton className='h-8 w-8 rounded-full' />
                    </div>
                    <main className="flex-1 p-4">
                        <Skeleton className="w-full h-full" />
                    </main>
                 </div>
            </div>
        )
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
    <UserProvider>
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
    </UserProvider>
  );
}
