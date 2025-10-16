

'use client';

import { Menu, ChevronLeft, Bell, MessageSquare, User, Settings, LifeBuoy, Calendar, Library, LogOut, Shield } from 'lucide-react';
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
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { NavLinks } from './nav-links';
import { TimeTracker } from '../dashboard/time-tracker';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { NotificationDropdown } from '../notifications/notification-dropdown';
import { useNotifications } from '@/context/notification-context';
import { useChat } from '@/context/chat-context';
import { ChatDropdown } from '../notifications/chat-dropdown';
import { useBranding } from '@/context/branding-context';
import { Logo } from '../icons';
import { cn } from '@/lib/utils';
import { useSidebar } from './sidebar';
import { useAISuggestions } from '@/context/ai-suggestion-context';
import { LibraryDropdown } from '../notifications/library-dropdown';
import { useUser } from '@/context/user-context';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';

const meetings: { [key: string]: { title: string; category: string } } = {
    'sample-meeting': {
        title: 'Job interview for Senior UX Engineer',
        category: 'Design'
    }
}


export function Header() {
  const { user } = useUser();
  const auth = useAuth();
  const userAvatar = user ? PlaceHolderImages.find((img) => img.id === user.id) : null;
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const { notifications } = useNotifications();
  const { unreadMessagesCount } = useChat();
  const { branding } = useBranding();
  const { open, setOpen } = useSidebar();
  const { unreadItems } = useAISuggestions();

  const isMeetingPage = pathname.startsWith('/meetings/');
  const meetingId = isMeetingPage && typeof params.meetingId === 'string' ? params.meetingId : null;
  const meetingDetails = meetingId ? meetings[meetingId] : null;

  const unreadCount = notifications.filter(n => !n.read).length;
  const unreadLibraryCount = unreadItems.length;

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/');
    }
  };

  return (
    <header className={cn(
        "fixed top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6 transition-[left,width] duration-300",
        open ? 'left-0 md:left-[220px] lg:left-[280px] w-full md:w-[calc(100%-220px)] lg:w-[calc(100%-280px)]' : 'left-0 md:left-[72px] lg:left-[72px] w-full md:w-[calc(100%-72px)]'
    )}>
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="default"
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
                
                <Logo className="h-6 w-6 text-primary" />
                <span className="">{branding.companyName}</span>
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

      <div className="w-full flex-1 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
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
            {!open && (
            <div className="hidden md:block">
                <TimeTracker layout="inline" />
            </div>
            )}
            <div className="md:hidden">
                <TimeTracker layout="inline" />
            </div>

            <LibraryDropdown>
                <Button variant="default" size="icon" className="relative h-8 w-8 hover:bg-primary/90">
                    <Library className="h-4 w-4" />
                    {unreadLibraryCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
                        {unreadLibraryCount}
                    </span>
                    )}
                    <span className="sr-only">Toggle Library</span>
                </Button>
            </LibraryDropdown>
        </div>
        
        {user?.role === 'Admin' && (
            <Button asChild>
                <Link href="/admin">
                    <Shield className="mr-2 h-4 w-4" />
                    Admin
                </Link>
            </Button>
        )}

        <div className="flex items-center gap-2">
            <ChatDropdown>
                <Button variant="default" size="icon" className="relative h-8 w-8 hover:bg-primary/90">
                    <MessageSquare className="h-4 w-4" />
                    {unreadMessagesCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
                        {unreadMessagesCount}
                    </span>
                    )}
                    <span className="sr-only">Toggle chat notifications</span>
                </Button>
            </ChatDropdown>

            <NotificationDropdown>
                <Button variant="outline" size="icon" className="relative h-8 w-8 hover:bg-primary hover:text-primary-foreground">
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
                        {unreadCount}
                    </span>
                    )}
                    <span className="sr-only">Toggle notifications</span>
                </Button>
            </NotificationDropdown>

            {user && (
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                        <AvatarImage
                        src={userAvatar?.imageUrl}
                        alt={user.name}
                        data-ai-hint={userAvatar?.imageHint}
                        className="object-cover object-top"
                        />
                        <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <span className="sr-only">Toggle user menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                    <Link href="/profile">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                    </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                    <Link href="/profile?tab=settings">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                    </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                    <Link href="/support">
                        <LifeBuoy className="mr-2 h-4 w-4" />
                        <span>Support</span>
                    </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Logout</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
                </DropdownMenu>
            )}
        </div>
      </div>
    </header>
  );
}
