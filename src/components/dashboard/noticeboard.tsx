
'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Megaphone, X } from 'lucide-react';

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
  const [currentIndex, setCurrentIndex] = useState(0);

  const unreadNotices = notices.filter((notice) => !notice.read);

  useEffect(() => {
    if (unreadNotices.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % unreadNotices.length);
      }, 8000); // 8 seconds

      return () => clearInterval(interval);
    }
  }, [unreadNotices.length]);

  const handleMarkAsRead = (id: number) => {
    setNotices((prevNotices) =>
      prevNotices.map((notice) =>
        notice.id === id ? { ...notice, read: true } : notice
      )
    );
    // Reset index to avoid out-of-bounds
    setCurrentIndex(0);
  };

  if (unreadNotices.length === 0) {
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

  const currentNotice = unreadNotices[currentIndex];

  return (
    <Card className="relative">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Megaphone />
          Noticeboard
        </CardTitle>
        <CardDescription>
          Important announcements. Automatically changes every 8 seconds.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <h3 className="font-semibold">{currentNotice.title}</h3>
        <p className="text-sm text-muted-foreground">
          {currentNotice.content}
        </p>
        <Button
          variant="link"
          size="sm"
          className="p-0 h-auto"
          onClick={() => handleMarkAsRead(currentNotice.id)}
        >
          Mark as read
        </Button>
      </CardContent>
      <div className="absolute top-4 right-4 text-xs text-muted-foreground">
        {currentIndex + 1} / {unreadNotices.length}
      </div>
    </Card>
  );
}
