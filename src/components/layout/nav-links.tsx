'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon, Package, Users, ListTodo, LineChart, Calendar, Megaphone, Store } from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { href: '/', icon: HomeIcon, label: 'Dashboard' },
  { href: '/performance', icon: Package, label: 'Performance' },
  { href: '/teams', icon: Users, label: 'Teams' },
  { href: '/tasks', icon: ListTodo, label: 'Tasks' },
  { href: '/analytics', icon: LineChart, label: 'Analytics' },
  { href: '/meetings', icon: Calendar, label: 'Meetings' },
  { href: '/notices', icon: Megaphone, label: 'Notices' },
  { href: '/marketing', icon: Store, label: 'Marketing' },
];

export function NavLinks({ isMobile = false }: { isMobile?: boolean }) {
  const pathname = usePathname();

  if (isMobile) {
    return (
      <>
        {links.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground',
              pathname === href && 'bg-muted text-foreground'
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}
      </>
    );
  }

  return (
    <>
      {links.map(({ href, icon: Icon, label }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-green-800 hover:text-white hover:shadow-lg hover:scale-105',
            pathname === href && 'bg-green-800 text-white shadow-md scale-105'
          )}
        >
          <Icon className="h-4 w-4" />
          {label}
        </Link>
      ))}
    </>
  );
}
