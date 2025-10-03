
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon, Package, Users, ListTodo, LineChart, Calendar, Megaphone, Store, FileText, MessageSquare as ChatIcon, LifeBuoy, Shield, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChat } from '@/context/chat-context';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip';
import { useSidebar } from './sidebar';
import { Button } from '../ui/button';

const links = [
  { href: '/dashboard', icon: HomeIcon, label: 'Dashboard' },
  { href: '/performance', icon: Package, label: 'Performance' },
  { href: '/reports', icon: FileText, label: 'Reports' },
  { href: '/teams', icon: Users, label: 'Teams' },
  { href: '/chat', icon: ChatIcon, label: 'Chat', notificationKey: 'chat' },
  { href: '/tasks', icon: ListTodo, label: 'Tasks' },
  { href: '/analytics', icon: LineChart, label: 'Analytics' },
  { href: '/meetings', icon: Calendar, label: 'Meetings' },
  { href: '/notices', icon: Megaphone, label: 'Notices' },
  { href: '/marketing', icon: Store, label: 'Marketing' },
];

const secondaryLinks = [
    { href: '/support', icon: LifeBuoy, label: 'Support' },
    { href: '/admin', icon: Shield, label: 'Admin' },
]

export function NavLinks({ isMobile = false, isCollapsed = false }: { isMobile?: boolean, isCollapsed?: boolean }) {
  const pathname = usePathname();
  const { unreadMessagesCount } = useChat();
  const { open, setOpen } = useSidebar();

  const getNotificationCount = (key?: string) => {
    if (key === 'chat') {
      return unreadMessagesCount;
    }
    return 0;
  };
  
  const renderLink = (href: string, icon: React.ElementType, label: string, notificationKey?: string) => {
    const count = getNotificationCount(notificationKey);
    const isActive = pathname === href || (href === '/teams' && pathname.startsWith('/teams/'));
    const Icon = icon;

    if (isCollapsed) {
        return (
            <TooltipProvider key={href} delayDuration={0}>
                <Tooltip>
                    <TooltipTrigger asChild>
                         <Link
                            href={href}
                            className={cn(
                                'flex items-center justify-center h-10 w-10 rounded-lg text-muted-foreground transition-all relative hover:text-primary-foreground',
                                isActive 
                                    ? 'bg-primary text-primary-foreground' 
                                    : 'hover:bg-primary'
                            )}
                        >
                            <Icon className="h-5 w-5" />
                            {count > 0 && (
                                <Badge className={cn(
                                    'absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0',
                                    isActive ? 'bg-primary-foreground text-primary' : 'bg-primary text-primary-foreground'
                                )}>
                                {count}
                                </Badge>
                            )}
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                        <p>{label}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        )
    }


    return (
        <div key={href} className={cn("flex items-center", isActive && "bg-primary rounded-lg")}>
            <Link
                href={href}
                className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-primary transition-all w-full',
                    isMobile ? 'border-b' : '',
                    isActive 
                        ? 'text-primary-foreground' 
                        : 'hover:bg-primary hover:text-primary-foreground'
                )}
            >
                <Icon className="h-4 w-4" />
                <span className="flex-1">{label}</span>
                {count > 0 && (
                    <Badge className={cn(
                        'h-5 w-5 flex items-center justify-center p-0',
                        isActive ? 'bg-primary-foreground text-primary' : 'bg-primary text-primary-foreground'
                    )}>
                    {count}
                    </Badge>
                )}
            </Link>
            {isActive && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-l-none rounded-r-lg bg-accent text-accent-foreground hover:bg-accent/90"
                    onClick={() => setOpen(!open)}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
            )}
        </div>
    )
  }

  return (
    <>
      {links.map(({ href, icon, label, notificationKey }) => renderLink(href, icon, label, notificationKey))}
      <Separator className="my-2" />
      {secondaryLinks.map(({ href, icon, label, notificationKey }) => renderLink(href, icon, label, notificationKey))}
    </>
  );
}
