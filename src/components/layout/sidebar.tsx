
'use client';

import Link from 'next/link';
import { HomeIcon } from 'lucide-react';
import { TimeTracker } from '@/components/dashboard/time-tracker';
import { NavLinks } from './nav-links';
import { ScrollArea } from '../ui/scroll-area';
import { Logo } from '../icons';
import { Button } from '../ui/button';

export function Sidebar() {
  return (
    <div className="hidden md:fixed md:inset-y-0 md:z-20 md:flex md:w-[220px] md:flex-col lg:w-[280px]">
      <div className="flex h-full max-h-screen flex-col gap-2 border-r bg-card">
        <div className="flex h-14 items-center justify-between border-b px-4 lg:h-[60px] lg:px-6">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold"
          >
            <Logo className="h-6 w-6" />
            <span className="">GoalLeader</span>
          </Link>
          <Button
            size="icon"
            asChild
            className="h-8 w-8 bg-gradient-to-r from-primary to-green-800 text-primary-foreground hover:from-primary/90 hover:to-green-700/90"
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
