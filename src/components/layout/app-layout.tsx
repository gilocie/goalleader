
'use client';

import { ReactNode, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSidebar } from './sidebar';
import { Header } from './header';
import { Footer } from '../dashboard/footer';
import { cn } from '@/lib/utils';
import { useChat } from '@/context/chat-context';
import { Skeleton } from '../ui/skeleton';
import { useUser } from '@/firebase';

import { IncomingCallDialog } from '@/components/chat/incoming-call-dialog';
import { VideoCallDialog } from '@/components/chat/video-call-dialog';
import { IncomingVoiceCallDialog } from '@/components/chat/incoming-voice-call-dialog';
import { VoiceCallDialog } from '@/components/chat/voice-call-dialog';

function LayoutWithTracker({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { open, setOpen } = useSidebar();
    const { user, loading } = useUser();
    const { 
        incomingCallFrom,
        acceptCall, 
        declineCall, 
        acceptedCallContact, 
        incomingVoiceCallFrom, 
        acceptVoiceCall, 
        declineVoiceCall, 
        acceptedVoiceCallContact, 
        isVideoCallOpen, 
        setIsVideoCallOpen, 
        isVoiceCallOpen, 
        setIsVoiceCallOpen, 
        currentCall,
        selectedContact
    } = useChat();

    
    const isChatPage = pathname === '/chat';
    const isMeetingPage = pathname.startsWith('/meetings/');
    const isLobbyPage = pathname.includes('/lobby');
    const isSetupPage = pathname.startsWith('/setup');

    useEffect(() => {
        if (isChatPage) {
            setOpen(false);
        }
    }, [isChatPage, setOpen]);
    
    useEffect(() => {
        // Allow access to login, register, landing, and setup pages without authentication
        const publicPages = ['/login', '/register', '/', '/setup', '/setup/wizard'];
        if (!loading && !user && !publicPages.includes(pathname)) {
            router.push('/login');
        }
    }, [user, loading, router, pathname]);

    useEffect(() => {
        if (acceptedCallContact) {
            setIsVideoCallOpen(true);
        }
    }, [acceptedCallContact, setIsVideoCallOpen]);

    useEffect(() => {
        if (acceptedVoiceCallContact) {
            setIsVoiceCallOpen(true);
        }
    }, [acceptedVoiceCallContact, setIsVoiceCallOpen]);
    
    const getCallContact = useCallback(() => {
        if (acceptedCallContact && currentCall?.type === 'video') return acceptedCallContact;
        if (acceptedVoiceCallContact && currentCall?.type === 'voice') return acceptedVoiceCallContact;
        if (incomingCallFrom && currentCall?.type === 'video') return incomingCallFrom;
        if (incomingVoiceCallFrom && currentCall?.type === 'voice') return incomingVoiceCallFrom;
        return selectedContact;
    }, [acceptedCallContact, acceptedVoiceCallContact, incomingCallFrom, incomingVoiceCallFrom, currentCall, selectedContact]);


    // Render children directly for special full-screen layouts
    if (isLobbyPage || (isMeetingPage && !pathname.endsWith('/meetings') && !isChatPage) || isSetupPage) {
      return <>{children}</>;
    }

    if (loading || !user) {
        // Don't show skeleton for public pages
        const publicPages = ['/login', '/register', '/'];
        if (publicPages.includes(pathname)) {
            return <>{children}</>;
        }

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
        <Header />
        <div className={cn(
            "flex flex-1 flex-col transition-[margin-left] duration-300", 
            open && "md:ml-[220px] lg:ml-[280px]",
            !open && "md:ml-[72px] lg:ml-[72px]",
        )}>
          
          {/* 
            This is the main content area.
            - `flex-1` makes it fill the vertical space between header and footer.
            - `flex flex-col` allows its children to also use flex properties.
            - `overflow-hidden` is key to containing children and their scrollbars.
          */}
          <main className="flex-1 flex flex-col overflow-hidden pt-14 lg:pt-[60px]">
            {children}
          </main>
          {/* Footer is only shown on specific pages */}
          {!isChatPage && !isMeetingPage && <Footer />}
        </div>
        
        {/* Global Call Dialogs */}
        {isVideoCallOpen && currentCall && getCallContact() && (
            <VideoCallDialog
                isOpen={isVideoCallOpen}
                onClose={() => setIsVideoCallOpen(false)}
                contact={getCallContact()!}
                isReceivingCall={!!incomingCallFrom && currentCall.status === 'ringing'}
            />
        )}

        {isVoiceCallOpen && currentCall && getCallContact() && (
            <VoiceCallDialog
                isOpen={isVoiceCallOpen}
                onClose={() => setIsVoiceCallOpen(false)}
                contact={getCallContact()!}
                isReceivingCall={!!incomingVoiceCallFrom && currentCall.status === 'ringing'}
            />
        )}

        {incomingCallFrom && !isVideoCallOpen && currentCall?.status === 'ringing' && (
            <IncomingCallDialog
                isOpen={true}
                onClose={declineCall}
                onAccept={() => { acceptCall(); setIsVideoCallOpen(true); }}
                onDecline={declineCall}
                contact={incomingCallFrom}
            />
        )}

        {incomingVoiceCallFrom && !isVoiceCallOpen && currentCall?.status === 'ringing' && (
            <IncomingVoiceCallDialog
                isOpen={true}
                onClose={declineVoiceCall}
                onAccept={() => { acceptVoiceCall(); setIsVoiceCallOpen(true); }}
                onDecline={declineVoiceCall}
                contact={incomingVoiceCallFrom}
            />
        )}
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
