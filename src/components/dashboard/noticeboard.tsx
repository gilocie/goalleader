
'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Megaphone } from 'lucide-react';
import Link from 'next/link';

type Notice = {
  id: number;
  title: string;
  content: string;
  read: boolean;
};

const initialNotices: Notice[] = [
  {
    id: 1,
    title: 'System Maintenance',
    content: 'The system will be down for maintenance on Sunday at 2 AM.',
    read: false,
  },
  {
    id: 2,
    title: 'New Feature: Dark Mode',
    content: 'We have launched a new dark mode. Check it out in settings!',
    read: true,
  },
  {
    id: 3,
    title: 'Holiday Schedule',
    content: 'The office will be closed on Monday for the public holiday.',
    read: false,
  },
  {
    id: 4,
    title: 'Team Meeting',
    content: 'A mandatory team meeting is scheduled for Friday at 10 AM.',
    read: false,
  },
];

export function Noticeboard() {
  const [notices, setNotices] = useState(initialNotices);

  const unreadNotices = notices.filter((notice) => !notice.read);
  const firstUnreadNotice = unreadNotices[0];

  if (!firstUnreadNotice) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                <Megaphone />
                Noticeboard
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">No unread notices.</p>
            </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Megaphone />
          Noticeboard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <h3 className="font-semibold">{firstUnreadNotice.title}</h3>
        <p className="text-sm text-muted-foreground">
          {firstUnreadNotice.content}
        </p>
        <Button
          variant="link"
          size="sm"
          className="p-0 h-auto"
          asChild
        >
          <Link href="#">View all</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
