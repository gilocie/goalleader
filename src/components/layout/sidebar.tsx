
'use client';

import Link from 'next/link';
import { HomeIcon } from 'lucide-react';
import { TimeTracker } from '@/components/dashboard/time-tracker';
import { NavLinks } from './nav-links';
import { ScrollArea } from '../ui/scroll-area';
import { Logo } from '../icons';
import { Button } from '../ui/button';
import { useBranding } from '@/context/branding-context';
import * as React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { SidebarTrigger } from '../ui/sidebar';

const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

type SidebarContext = {
  open: boolean;
  setOpen: (open: boolean) => void;
  isMobile: boolean;
};

const SidebarContext = React.createContext<SidebarContext | null>(null);

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }
  return context;
}

export const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, style, children, ...props }, ref) => {
    const isMobile = useIsMobile();
    const [open, _setOpen] = React.useState(true);
    
    const setOpen = React.useCallback((value: boolean) => {
        _setOpen(value);
        document.cookie = `${SIDEBAR_COOKIE_NAME}=${value}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
    }, []);

    const contextValue = React.useMemo<SidebarContext>(() => ({
        open,
        setOpen,
        isMobile,
    }), [open, setOpen, isMobile]);

    return (
        <SidebarContext.Provider value={contextValue}>
            <div className={cn("w-full", className)} ref={ref} {...props}>
                {children}
            </div>
        </SidebarContext.Provider>
    );
});
SidebarProvider.displayName = "SidebarProvider";


export function Sidebar() {
  const { branding } = useBranding();
  const { open } = useSidebar();
  
  if (!open) {
    return (
        <div className="hidden md:fixed md:inset-y-0 md:z-20 md:flex md:w-[72px] md:flex-col lg:w-[72px] transition-all duration-300">
             <div className="flex h-full max-h-screen flex-col items-center gap-2 border-r bg-card">
                 <div className="flex h-14 items-center justify-center border-b px-4 lg:h-[60px] w-full">
                    <Link href="/" className="flex items-center gap-2 font-semibold">
                        <Logo className="h-6 w-6" />
                    </Link>
                </div>
                 <ScrollArea className="flex-1 w-full">
                    <nav className="flex flex-col items-center gap-2 text-sm font-medium px-2 lg:px-4 py-4">
                        <NavLinks isCollapsed={true} />
                    </nav>
                </ScrollArea>
             </div>
        </div>
    );
  }

  return (
    <div className="hidden md:fixed md:inset-y-0 md:z-20 md:flex md:w-[220px] md:flex-col lg:w-[280px] transition-all duration-300">
      <div className="flex h-full max-h-screen flex-col gap-2 border-r bg-card">
        <div className="flex h-14 items-center justify-between border-b px-4 lg:h-[60px] lg:px-6">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold"
          >
            <Logo className="h-6 w-6" />
            <span className="">{branding.companyName}</span>
          </Link>
        </div>
        <ScrollArea className="flex-1">
          <nav className="flex flex-col gap-2 text-sm font-medium px-2 lg:px-4 py-4">
            <NavLinks />
          </nav>
        </ScrollArea>
        <div className="mt-auto p-4 border-t">
          <TimeTracker />
        </div>
      </div>
    </div>
  );
}
