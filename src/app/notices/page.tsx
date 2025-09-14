
'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Bot, User } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const staffNotices = [
    {
      id: 1,
      title: 'System Maintenance',
      content: 'The system will be down for maintenance on Sunday at 2 AM.',
      author: 'Admin',
      date: '2024-07-28',
      read: false,
    },
    {
      id: 3,
      title: 'Holiday Schedule',
      content: 'The office will be closed on Monday for the public holiday.',
      author: 'HR Department',
      date: '2024-07-26',
      read: false,
    },
    {
      id: 4,
      title: 'Team Meeting',
      content: 'A mandatory team meeting is scheduled for Friday at 10 AM.',
      author: 'Management',
      date: '2024-07-25',
      read: false,
    },
];

const readNotices = [
    {
        id: 2,
        title: 'New Feature: Dark Mode',
        content: 'We have launched a new dark mode. Check it out in settings!',
        author: 'Product Team',
        date: '2024-07-27',
        read: true,
    }
];

const aiNotices = [
    {
        id: 101,
        title: 'Performance Anomaly Detected',
        content: 'Liam Martinez\'s task completion rate has dropped by 15% this week. Consider scheduling a check-in.',
        date: '2024-07-29',
        read: false,
    },
    {
        id: 102,
        title: 'Upcoming Project Milestone',
        content: 'Project "Phoenix" is 90% complete and the deadline is approaching. Ensure all dependencies are resolved.',
        date: '2024-07-28',
        read: false,
    }
];

const NoticeCard = ({ notice, icon }: { notice: (typeof staffNotices)[0], icon?: React.ReactNode }) => (
    <Card>
        <CardHeader>
            <div className="flex items-center gap-3">
                {icon && <div className="bg-primary/10 text-primary p-2 rounded-full">{icon}</div>}
                <div>
                    <CardTitle className='text-lg'>{notice.title}</CardTitle>
                    <CardDescription>
                        Posted by {notice.author} on {new Date(notice.date).toLocaleDateString()}
                    </CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground">{notice.content}</p>
        </CardContent>
    </Card>
);


export default function NoticesPage() {
  const unreadCount = staffNotices.length + aiNotices.length;
  const readCount = readNotices.length;

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
          <CardContent>
            <Tabs defaultValue="unread">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
                    <TabsTrigger value="read">Read ({readCount})</TabsTrigger>
                </TabsList>
                
                <TabsContent value="unread" className="mt-4">
                    <Tabs defaultValue="staff">
                         <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="staff">From Staff ({staffNotices.length})</TabsTrigger>
                            <TabsTrigger value="ai">GoalLeader AI ({aiNotices.length})</TabsTrigger>
                        </TabsList>
                        <TabsContent value="staff" className="mt-4 space-y-4">
                           {staffNotices.map((notice) => (
                                <NoticeCard key={notice.id} notice={notice} icon={<User className="h-5 w-5" />} />
                            ))}
                        </TabsContent>
                         <TabsContent value="ai" className="mt-4 space-y-4">
                           {aiNotices.map((notice) => (
                                <NoticeCard key={notice.id} notice={{...notice, author: 'GoalLeader AI'}} icon={<Bot className="h-5 w-5" />} />
                            ))}
                        </TabsContent>
                    </Tabs>
                </TabsContent>

                <TabsContent value="read" className="mt-4 space-y-4">
                     {readNotices.map((notice) => (
                        <NoticeCard key={notice.id} notice={notice} />
                    ))}
                </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </AppLayout>
  );
}
