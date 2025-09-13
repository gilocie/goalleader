
'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video } from 'lucide-react';

const meetings = [
  {
    title: 'Meeting with Arc Company',
    time: '02:00 pm - 04:00 pm',
    date: '2024-07-29',
  },
  {
    title: 'Project Alpha Deadline',
    time: 'Due: 25th July',
    date: '2024-07-25',
  },
  {
    title: 'Design Review',
    time: '2:00 PM - 3:00 PM',
    date: '2024-07-30',
  },
  {
    title: 'Weekly Sync',
    time: '10:00 AM - 10:30 AM',
    date: '2024-08-01',
  },
  {
    title: 'Client Demo',
    time: '03:00 PM - 04:00 PM',
    date: '2024-08-02',
  },
];


export default function MeetingsPage() {
  return (
    <AppLayout>
      <main className="flex-grow p-4 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Meetings</CardTitle>
            <CardDescription>A list of your upcoming meetings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {meetings.map((meeting, index) => (
                 <Card key={index}>
                    <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                        <p className="font-semibold text-lg leading-none">
                            {meeting.title}
                        </p>
                        <Button>
                            <Video className="mr-2 h-4 w-4" /> Start Meeting
                        </Button>
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">{new Date(meeting.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            <p className="text-sm text-muted-foreground">{meeting.time}</p>
                        </div>
                    </CardContent>
                 </Card>
            ))}
          </CardContent>
        </Card>
      </main>
    </AppLayout>
  );
}
