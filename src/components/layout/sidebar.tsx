
'use client';

import Link from 'next/link';
import { HomeIcon } from 'lucide-react';
import { TimeTracker } from '@/components/dashboard/time-tracker';
import { NavLinks } from './nav-links';
import { ScrollArea } from '../ui/scroll-area';
import { Logo } from '../icons';
import { Button } from '../ui/button';
import { useBranding } from '@/context/branding-context';
import { useSidebar } from '@/components/ui/sidebar';

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
          <Button
            size="icon"
            asChild
            className="h-8 w-8"
          >
            <Link href="/">
              <HomeIcon className="h-5 w-5" />
              <span className="sr-only">Home</span>
            </Link>
          </Button>
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
