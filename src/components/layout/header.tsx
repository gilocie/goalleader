
'use client';

import { Menu, ChevronLeft, Bell } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useParams } from 'next/navigation';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Logo } from '@/components/icons';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { NavLinks } from './nav-links';
import { TimeTracker } from '../dashboard/time-tracker';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { NotificationDropdown } from '../notifications/notification-dropdown';
import { useNotifications } from '@/context/notification-context';

const meetings: { [key: string]: { title: string; category: string } } = {
    'sample-meeting': {
        title: 'Job interview for Senior UX Engineer',
        category: 'Design'
    }
}


export function Header() {
  const userAvatar = PlaceHolderImages.find((img) => img.id === 'patrick-achitabwino-m1');
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const { notifications } = useNotifications();

  const isMeetingPage = pathname.startsWith('/meetings/');
  const meetingId = isMeetingPage && typeof params.meetingId === 'string' ? params.meetingId : null;
  const meetingDetails = meetingId ? meetings[meetingId] : null;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 md:hidden"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col">
            <SheetTitle className="sr-only">Main Menu</SheetTitle>
            <div className="flex items-center gap-2 text-lg font-semibold border-b pb-4">
              <Link
                href="#"
                className="flex items-center gap-2 text-lg font-semibold"
              >
                
                <span className="">GoalLeader</span>
              </Link>
            </div>
            <ScrollArea className="flex-1">
              <nav className="grid gap-2 text-lg font-medium py-4">
                <NavLinks isMobile={true} />
              </nav>
            </ScrollArea>
          <div className="mt-auto border-t pt-4">
            <TimeTracker />
          </div>
        </SheetContent>
      </Sheet>

      <div className="w-full flex-1">
        {isMeetingPage && meetingDetails && (
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ChevronLeft />
                </Button>
                <div>
                    <h1 className="font-semibold text-lg">{meetingDetails.title}</h1>
                    <Badge variant="outline" className="text-xs">{meetingDetails.category}</Badge>
                </div>
            </div>
        )}
      </div>

       <NotificationDropdown>
            <Button variant="outline" size="icon" className="relative h-8 w-8">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
                    {unreadCount}
                </span>
                )}
                <span className="sr-only">Toggle notifications</span>
            </Button>
        </NotificationDropdown>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon" className="rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={userAvatar?.imageUrl}
                alt="User avatar"
                data-ai-hint={userAvatar?.imageHint}
              />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <span className="sr-only">Toggle user menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuItem>Support</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
