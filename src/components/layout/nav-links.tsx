
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, Users, ListTodo, LineChart, Calendar, Megaphone, Store, FileText, MessageSquare as ChatIcon, LifeBuoy, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChat } from '@/context/chat-context';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip';
import { useSidebar } from './sidebar';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

type NavLink = {
    href: string;
    icon: React.ElementType;
    label: string;
    notificationKey?: string;
    subItems?: NavLink[];
};

const links: NavLink[] = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { 
    href: '/tasks', 
    icon: ListTodo, 
    label: 'Tasks',
    subItems: [
        { href: '/performance', icon: Package, label: 'Performance' },
        { href: '/reports', icon: FileText, label: 'Reports' },
        { href: '/analytics', icon: LineChart, label: 'Analytics' },
    ]
  },
  { href: '/marketing', icon: Store, label: 'Marketing' },
  { href: '/teams', icon: Users, label: 'Teams' },
  { href: '/chat', icon: ChatIcon, label: 'Chat', notificationKey: 'chat' },
  { href: '/meetings', icon: Calendar, label: 'Meetings' },
  { href: '/notices', icon: Megaphone, label: 'Notices' },
];

const secondaryLinks: NavLink[] = [
    { href: '/support', icon: LifeBuoy, label: 'Support' },
    { href: '/admin', icon: Shield, label: 'Admin' },
]

export function NavLinks({ isMobile = false, isCollapsed = false }: { isMobile?: boolean, isCollapsed?: boolean }) {
  const pathname = usePathname();
  const { unreadMessagesCount } = useChat();

  const getNotificationCount = (key?: string) => {
    if (key === 'chat') {
      return unreadMessagesCount;
    }
    return 0;
  };
  
  const renderLink = (link: NavLink, isSecondary: boolean = false) => {
    const { href, icon: Icon, label, notificationKey } = link;
    const count = getNotificationCount(notificationKey);
    const isActive = pathname === href || (pathname.startsWith(href) && href !== '/');

    if (isCollapsed) {
        return (
            <TooltipProvider key={href} delayDuration={0}>
                <Tooltip>
                    <TooltipTrigger asChild>
                         <Link
                            href={href}
                            className={cn(
                                'flex items-center justify-center h-10 w-10 rounded-lg text-muted-foreground transition-all relative',
                                isSecondary ? 'hover:bg-primary-foreground/10 hover:text-primary-foreground' : 'hover:text-primary-foreground hover:bg-primary',
                                isActive && !isSecondary && 'bg-primary text-primary-foreground',
                                isActive && isSecondary && 'bg-primary-foreground/20 text-primary-foreground'
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

    if (link.subItems) {
        const isParentActive = link.subItems.some(sub => pathname.startsWith(sub.href));
        return (
            <Accordion key={href} type="single" collapsible defaultValue={isParentActive ? 'tasks' : undefined} className="w-full">
                <AccordionItem value="tasks" className="border-b-0">
                    <AccordionTrigger
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:no-underline font-semibold",
                             'hover:bg-muted/50 shadow-sm hover:shadow-md',
                            (isActive && href !== '/') || isParentActive
                                ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                                : 'bg-card'
                        )}
                    >
                        <Icon className="h-4 w-4" />
                        <span className="flex-1 text-left">{label}</span>
                    </AccordionTrigger>
                    <AccordionContent className="pl-6 pt-1">
                        <div className="flex flex-col gap-1">
                            {link.subItems.map(subLink => {
                                const isSubActive = pathname.startsWith(subLink.href);
                                return (
                                    <Link
                                        key={subLink.href}
                                        href={subLink.href}
                                        className={cn(
                                            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all text-sm",
                                            isSubActive
                                                ? 'bg-primary/10 text-primary font-semibold'
                                                : 'hover:bg-muted/50'
                                        )}
                                    >
                                        <subLink.icon className="h-4 w-4" />
                                        {subLink.label}
                                    </Link>
                                )
                            })}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        )
    }

    const linkContent = (
      <>
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
      </>
    );

    return (
        <Link
            key={href}
            href={href}
            className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 transition-all shadow-sm hover:shadow-md font-semibold',
                isMobile ? 'border-b' : '',
                isSecondary 
                    ? cn(
                        'text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground',
                        isActive && 'bg-primary-foreground/20 text-primary-foreground'
                      )
                    : cn(
                        'text-muted-foreground hover:bg-muted/50',
                        isActive && 'bg-primary text-primary-foreground'
                      )
            )}
        >
            {linkContent}
        </Link>
    )
  }

  return (
    <>
      {links.map(link => renderLink(link))}
      <Separator className="my-2" />
      <div className={cn("rounded-lg p-2 space-y-1", isCollapsed ? "bg-transparent" : "bg-primary")}>
        {secondaryLinks.map(link => renderLink(link, true))}
      </div>
    </>
  );
}
