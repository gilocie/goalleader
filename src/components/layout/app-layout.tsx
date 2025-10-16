
'use client';

import { ReactNode, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSidebar } from './sidebar';
import { Header } from './header';
import { Footer } from '../dashboard/footer';
import { cn } from '@/lib/utils';
import { useChat } from '@/context/chat-context';
import { Skeleton } from '../ui/skeleton';
import { useUser } from '@/firebase';

import { Sidebar } from './sidebar';
import { Logo } from '../icons';
import { GlobalCallDialogs } from '../chat/global-call-dialogs';

function LayoutWithTracker({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { open, setOpen } = useSidebar();
    const { user, loading } = useUser();
    
    const isMeetingPage = pathname.startsWith('/meetings/');
    const isLobbyPage = pathname.includes('/lobby');
    const isSetupPage = pathname.startsWith('/setup');

    useEffect(() => {
        // Allow access to login, register, landing, and setup pages without authentication
        const publicPages = ['/login', '/register', '/', '/setup', '/setup/wizard', '/super-admin'];
        if (!loading && !user && !publicPages.includes(pathname)) {
            router.push('/login');
        }
    }, [user, loading, router, pathname]);

    // Render children directly for special full-screen layouts
    if (isLobbyPage || (isMeetingPage && !pathname.endsWith('/meetings')) || isSetupPage) {
      return <>{children}</>;
    }

    if (loading || !user) {
        // Don't show skeleton for public pages
        const publicPages = ['/login', '/register', '/', '/setup', '/setup/wizard', '/super-admin'];
        if (publicPages.includes(pathname)) {
            return <>{children}</>;
        }

        return (
             <div className="flex min-h-screen w-full bg-muted/40">
                <div className={cn("hidden md:flex md:flex-col border-r bg-card transition-all duration-300 md:w-[220px] lg:w-[280px]")}>
                    <div className='flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6'>
                        <Link href="/" className="flex items-center gap-2 font-semibold">
                            <Logo className="h-6 w-6" />
                            <span>GoalLeader</span>
                        </Link>
                    </div>
                    <div className='flex-1 p-4 space-y-2'>
                        {[...Array(8)].map((_,i) => <Skeleton key={i} className='h-10 w-full' />)}
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
            open ? "md:ml-[220px] lg:ml-[280px]" : "md:ml-[72px] lg:ml-[72px]",
        )}>
          <Header />
          <main className="flex-1 flex flex-col overflow-hidden pt-14 lg:pt-[60px]">
            {children}
          </main>
          {!pathname.startsWith('/chat') && !isMeetingPage && <Footer />}
        </div>
        <GlobalCallDialogs />
      </div>
    );
  }

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <LayoutWithTracker>
        {children}
    </LayoutWithTracker>
  );
}
