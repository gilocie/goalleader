
'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
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
  {
    id: 5,
    title: 'New Project Kick-off',
    content: 'Project "Phoenix" will kick-off next week. Get ready!',
    read: false,
  },
  {
    id: 6,
    title: 'Security Update',
    content: 'Please update your passwords by the end of this week.',
    read: false,
  }
];

export function Noticeboard() {
  const [notices] = useState(initialNotices);
  const [currentNoticeIndex, setCurrentNoticeIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  const unreadNotices = notices.filter((notice) => !notice.read);
  const currentNotice = unreadNotices[currentNoticeIndex];

  useEffect(() => {
    if (unreadNotices.length <= 1) return;

    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setCurrentNoticeIndex((prevIndex) =>
          (prevIndex + 1) % unreadNotices.length
        );
        setIsFading(false);
      }, 500); // fade-out duration
    }, 5000); // Change notice every 5 seconds

    return () => clearInterval(interval);
  }, [unreadNotices.length]);

  if (!currentNotice) {
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
      <CardContent className="space-y-4">
        <div className={`transition-opacity duration-500 ${isFading ? 'opacity-0' : 'opacity-100'}`}>
            <Card className="bg-primary text-primary-foreground p-4 h-[100px] flex flex-col justify-center">
                <h3 className="font-semibold">{currentNotice.title}</h3>
                <p className="text-sm text-primary-foreground/80 line-clamp-2">
                    {currentNotice.content}
                </p>
            </Card>
        </div>
        <Button
          variant="link"
          size="sm"
          className="p-0 h-auto"
          asChild
        >
          <Link href="/notices">View all</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
