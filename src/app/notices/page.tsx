
'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

const initialNotices = [
    {
      id: 1,
      title: 'System Maintenance',
      content: 'The system will be down for maintenance on Sunday at 2 AM.',
      author: 'Admin',
      date: '2024-07-28',
    },
    {
      id: 2,
      title: 'New Feature: Dark Mode',
      content: 'We have launched a new dark mode. Check it out in settings!',
      author: 'Product Team',
      date: '2024-07-27',
    },
    {
      id: 3,
      title: 'Holiday Schedule',
      content: 'The office will be closed on Monday for the public holiday.',
      author: 'HR Department',
      date: '2024-07-26',
    },
    {
      id: 4,
      title: 'Team Meeting',
      content: 'A mandatory team meeting is scheduled for Friday at 10 AM.',
      author: 'Management',
      date: '2024-07-25',
    },
    {
      id: 5,
      title: 'New Project Kick-off',
      content: 'Project "Phoenix" will kick-off next week. Get ready!',
      author: 'Project Office',
      date: '2024-07-24',
    },
    {
      id: 6,
      title: 'Security Update',
      content: 'Please update your passwords by the end of this week.',
      author: 'IT Department',
      date: '2024-07-23',
    }
  ];

export default function NoticesPage() {
  return (
    <AppLayout>
      <main className="flex-grow p-4 md:p-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Noticeboard</CardTitle>
                <CardDescription>All company announcements and notices.</CardDescription>
            </div>
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Notice
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {initialNotices.map((notice) => (
              <Card key={notice.id}>
                <CardHeader>
                  <CardTitle className='text-lg'>{notice.title}</CardTitle>
                  <CardDescription>
                    Posted by {notice.author} on {new Date(notice.date).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{notice.content}</p>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      </main>
    </AppLayout>
  );
}
