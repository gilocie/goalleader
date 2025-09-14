
'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video, PlusCircle, Bot } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

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

const aiSuggestedMeetings = [
    {
      title: 'Follow-up on Project Phoenix',
      reason: 'AI detected the project is nearing a major milestone.',
      participants: ['Sophia Davis', 'Liam Martinez'],
    },
    {
      title: 'Q3 Planning Session',
      reason: 'It\'s time to plan for the next quarter based on current project velocity.',
      participants: ['Charlotte Rodriguez', 'You'],
    },
];


export default function MeetingsPage() {
  return (
    <AppLayout>
      <main className="flex-grow p-4 md:p-8 space-y-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Meetings</CardTitle>
              <CardDescription>A list of your upcoming meetings.</CardDescription>
            </div>
            <Button className="bg-gradient-to-r from-primary to-green-700 text-primary-foreground hover:from-primary/90 hover:to-green-700/90">
              <PlusCircle className="mr-2 h-4 w-4" /> Create New Meeting
            </Button>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {meetings.map((meeting, index) => (
                 <Card key={index} className="shadow-md hover:shadow-lg transition-shadow">
                    <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                        <p className="font-semibold text-lg leading-none">
                            {meeting.title}
                        </p>
                        <Button className="bg-gradient-to-r from-primary to-green-700 text-primary-foreground hover:from-primary/90 hover:to-green-700/90">
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

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bot className="text-primary" />
                    GoalLeader AI Suggestions
                </CardTitle>
                <CardDescription>AI-powered recommendations for meetings you should schedule.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
                {aiSuggestedMeetings.map((suggestion, index) => (
                    <Card key={index} className="bg-muted/50">
                        <CardHeader>
                            <CardTitle className="text-lg">{suggestion.title}</CardTitle>
                            <CardDescription>{suggestion.reason}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="text-sm font-medium">Suggested Participants</h4>
                                <p className="text-sm text-muted-foreground">{suggestion.participants.join(', ')}</p>
                            </div>
                            <Button>
                                <PlusCircle className="mr-2 h-4 w-4" /> Schedule Meeting
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </CardContent>
        </Card>
      </main>
    </AppLayout>
  );
}
