
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
import { ChevronLeft } from 'lucide-react';

const SIDEBAR_COOKIE_NAME = 'sidebar_state';
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

type SidebarContextType = {
  open: boolean;
  setOpen: (open: boolean) => void;
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

  const setOpen = React.useCallback(
    (value: boolean) => {
      _setOpen(value);
      if (!isMobile) {
        document.cookie = `${SIDEBAR_COOKIE_NAME}=${value}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
      }
    },
    [isMobile]
  );

  const contextValue = React.useMemo<SidebarContextType>(
    () => ({
      open,
      setOpen,
      isMobile,
    }),
    [open, setOpen, isMobile]
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
    <div className={cn(
        "hidden md:fixed md:inset-y-0 md:z-20 md:flex md:flex-col transition-all duration-300",
        open ? expandedWidth : collapsedWidth
    )}>
      {/* Toggle button that is always rendered */}
      <Button
          variant="ghost"
          size="icon"
          className={cn(
              "absolute top-1/2 -right-4 h-8 w-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 z-30",
              "transition-transform duration-300",
          )}
          onClick={() => setOpen(!open)}
      >
          <ChevronLeft className={cn("h-4 w-4 transition-transform duration-300", !open && "rotate-180")} />
      </Button>

      {/* Expanded Sidebar */}
      <div className={cn(
        "flex h-full max-h-screen flex-col gap-2 border-r bg-card transition-opacity duration-300",
        !open && "opacity-0 pointer-events-none"
      )}>
        <div className="flex h-14 items-center justify-between border-b px-4 lg:h-[60px] lg:px-6">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold"
          >
            <Logo className="h-6 w-6 text-primary" />
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
      
      {/* Collapsed Sidebar */}
      <div className={cn(
        "flex h-full max-h-screen flex-col items-center gap-2 border-r bg-card transition-opacity duration-300",
        open && "opacity-0 pointer-events-none"
      )}>
          <div className="flex h-14 items-center justify-center border-b px-4 lg:h-[60px] w-full">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Logo className="h-6 w-6 text-primary" />
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
