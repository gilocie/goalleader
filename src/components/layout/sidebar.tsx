
'use client';

import Link from 'next/link';
import * as React from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Logo } from '../icons';
import { TimeTracker } from '@/components/dashboard/time-tracker';
import { NavLinks } from './nav-links';
import { ScrollArea } from '../ui/scroll-area';
import { useBranding } from '@/context/branding-context';
import { Button } from '../ui/button';
import { ChevronLeft, HomeIcon } from 'lucide-react';
import { SidebarTrigger } from '../ui/sidebar';

const SIDEBAR_COOKIE_NAME = 'sidebar_state';
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

type SidebarContextType = {
  open: boolean;
  setOpen: (open: boolean) => void;
  adminSidebarOpen: boolean;
  setAdminSidebarOpen: (open: boolean) => void;
  isMobile: boolean;
};

const SidebarContext = React.createContext<SidebarContextType | null>(null);

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider.');
  }
  return context;
}

export const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, style, children, ...props }, ref) => {
  const isMobile = useIsMobile();
  const [open, _setOpen] = React.useState(true);
  const [adminSidebarOpen, _setAdminSidebarOpen] = React.useState(false);

  const setOpen = React.useCallback(
    (value: boolean) => {
      _setOpen(value);
      if (!isMobile) {
        document.cookie = `${SIDEBAR_COOKIE_NAME}=${value}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
      }
    },
    [isMobile]
  );
  
  const setAdminSidebarOpen = React.useCallback(
    (value: boolean) => {
      _setAdminSidebarOpen(value);
    },
    []
  );

  const contextValue = React.useMemo<SidebarContextType>(
    () => ({
      open,
      setOpen,
      adminSidebarOpen,
      setAdminSidebarOpen,
      isMobile,
    }),
    [open, setOpen, adminSidebarOpen, setAdminSidebarOpen, isMobile]
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <div className={cn('w-full', className)} ref={ref} {...props}>
        {children}
      </div>
    </SidebarContext.Provider>
  );
});
SidebarProvider.displayName = 'SidebarProvider';

export function Sidebar() {
  const { branding } = useBranding();
  const { open, setOpen } = useSidebar();

  const collapsedWidth = 'md:w-[72px] lg:w-[72px]';
  const expandedWidth = 'md:w-[220px] lg:w-[280px]';

  return (
    <div
      className={cn(
        'hidden md:fixed md:inset-y-0 md:z-20 md:flex md:flex-col border-r bg-card transition-all duration-300',
        open ? expandedWidth : collapsedWidth
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'absolute top-1/2 -right-4 h-8 w-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 z-30',
          'transition-all duration-300'
        )}
        onClick={() => setOpen(!open)}
      >
        <ChevronLeft
          className={cn(
            'h-4 w-4 transition-transform duration-300',
            !open && 'rotate-180'
          )}
        />
      </Button>

      <div
        className={cn(
          'flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6 transition-all duration-300 justify-between',
        )}
      >
        <div
          className="flex items-center gap-2 font-semibold"
        >
          <Logo className="h-6 w-6 text-primary" />
          <span className={cn('transition-opacity duration-200', !open && 'opacity-0 w-0')}>
            {branding.companyName}
          </span>
        </div>
        <Link href="/dashboard" className="h-8 w-8 flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
            <HomeIcon className="h-5 w-5" />
        </Link>
      </div>

      <ScrollArea className="flex-1">
        <nav
          className={cn(
            'flex flex-col gap-2 text-sm font-medium py-4 transition-all duration-300',
            open ? 'px-2 lg:px-4' : 'items-center px-2'
          )}
        >
          <NavLinks isCollapsed={!open} />
        </nav>
      </ScrollArea>
      
      <div className={cn(
          "mt-auto p-4 border-t transition-opacity duration-300",
          !open && 'opacity-0 pointer-events-none h-0 p-0 border-none'
      )}>
        <TimeTracker />
      </div>
    </div>
  );
}
