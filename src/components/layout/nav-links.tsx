
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon, Package, Users, ListTodo, LineChart, Calendar, Megaphone, Store, FileText, MessageSquare as ChatIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChat } from '@/context/chat-context';
import { Badge } from '../ui/badge';

const links = [
  { href: '/', icon: HomeIcon, label: 'Dashboard' },
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

export function NavLinks({ isMobile = false }: { isMobile?: boolean }) {
  const pathname = usePathname();
  const { unreadMessagesCount } = useChat();

  const getNotificationCount = (key?: string) => {
    if (key === 'chat') {
      return unreadMessagesCount;
    }
    return 0;
  };

  return (
    <>
      {links.map(({ href, icon: Icon, label, notificationKey }) => {
        const count = getNotificationCount(notificationKey);
        const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-secondary-foreground transition-all relative',
              isMobile 
                ? 'text-muted-foreground hover:text-foreground'
                : 'bg-secondary shadow-sm hover:bg-secondary/80 hover:shadow-lg',
              isActive && (isMobile 
                ? 'bg-gradient-to-r from-primary to-green-700 text-white'
                : 'bg-green-800 text-white shadow-md')
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="flex-1">{label}</span>
            {count > 0 && (
              <Badge className={cn(
                  'h-5 w-5 flex items-center justify-center p-0',
                  isActive ? 'bg-white text-green-800' : 'bg-primary text-primary-foreground'
              )}>
                {count}
              </Badge>
            )}
          </Link>
        )
      })}
    </>
  );
}
