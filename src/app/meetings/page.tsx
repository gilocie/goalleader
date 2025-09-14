
'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video, PlusCircle, Bot, Check, X, MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
import { ScheduleMeetingDialog } from '@/components/meetings/schedule-meeting-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';


const upcomingMeetings = [
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
];

const invitedMeetings = [
    {
        title: 'Q3 Brainstorming Session',
        time: '11:00 AM - 12:00 PM',
        date: '2024-08-05',
        organizer: 'Sophia Davis',
    },
    {
        title: 'Frontend Architecture Review',
        time: '01:00 PM - 02:00 PM',
        date: '2024-08-06',
        organizer: 'Liam Martinez',
    },
];

const myMeetings = [
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

const endedMeetings = [
    {
        title: 'Project Kick-off',
        time: '10:00 AM - 11:00 AM',
        date: '2024-07-15',
    }
]

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

export type AISuggestedMeeting = (typeof aiSuggestedMeetings)[0];

const UpcomingMeetingCard = ({ title, time, date }: { title: string; time: string; date: string }) => (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
        <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
            <p className="font-semibold text-lg leading-none">{title}</p>
            <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-500/90 hover:to-indigo-600/90">
                <Video className="mr-2 h-4 w-4" /> Join Meeting
            </Button>
            <div className="text-center">
                <p className="text-sm text-muted-foreground">{new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p className="text-sm text-muted-foreground">{time}</p>
            </div>
        </CardContent>
    </Card>
);

const MyMeetingCard = ({ title, time, date }: { title: string; time: string; date: string }) => (
    <Card className="shadow-md hover:shadow-lg transition-shadow relative">
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="absolute top-2 right-2">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem>
                    <Edit className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
        <CardContent className="p-6 flex flex-col items-center text-center space-y-4 pt-12">
            <p className="font-semibold text-lg leading-none">{title}</p>
            <Button className="bg-gradient-to-r from-primary to-green-700 text-primary-foreground hover:from-primary/90 hover:to-green-700/90">
                <Video className="mr-2 h-4 w-4" /> Start Meeting
            </Button>
            <div className="text-center">
                <p className="text-sm text-muted-foreground">{new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p className="text-sm text-muted-foreground">{time}</p>
            </div>
        </CardContent>
    </Card>
);

const EndedMeetingCard = ({ title, time, date }: { title: string; time: string; date: string }) => (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
        <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
            <p className="font-semibold text-lg leading-none">{title}</p>
            <Button variant="outline">
                <Eye className="mr-2 h-4 w-4" /> View Details
            </Button>
            <div className="text-center">
                <p className="text-sm text-muted-foreground">{new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p className="text-sm text-muted-foreground">{time}</p>
            </div>
        </CardContent>
    </Card>
);


const InvitedMeetingCard = ({ title, time, date, organizer }: { title: string; time: string; date: string; organizer: string }) => (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
        <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
            <p className="font-semibold text-lg leading-none">{title}</p>
            <div className="flex flex-col gap-2 w-full">
                 <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                    <Check className="mr-2 h-4 w-4" /> Accept
                </Button>
                <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/10">
                    <X className="mr-2 h-4 w-4" /> Decline
                </Button>
            </div>
            <div className="text-center">
                <p className="text-sm text-muted-foreground">{new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} - {time}</p>
                <p className="text-xs text-muted-foreground">From: {organizer}</p>
            </div>
        </CardContent>
    </Card>
);


export default function MeetingsPage() {
  const [isScheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<AISuggestedMeeting | null>(null);

  const handleScheduleClick = (suggestion: AISuggestedMeeting) => {
    setSelectedSuggestion(suggestion);
    setScheduleDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setScheduleDialogOpen(false);
    setSelectedSuggestion(null);
  }

  return (
    <AppLayout>
      <main className="flex-grow p-4 md:p-8 space-y-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Meetings</CardTitle>
              <CardDescription>Manage all your meetings in one place.</CardDescription>
            </div>
            <Button 
                onClick={() => setScheduleDialogOpen(true)}
                className="bg-gradient-to-r from-primary to-green-700 text-primary-foreground hover:from-primary/90 hover:to-green-700/90"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Create New Meeting
            </Button>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="upcoming">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                    <TabsTrigger value="invited">Invited</TabsTrigger>
                    <TabsTrigger value="my-meetings">My Meetings</TabsTrigger>
                    <TabsTrigger value="ended">Ended</TabsTrigger>
                </TabsList>

                <TabsContent value="upcoming">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-4">
                        {upcomingMeetings.map((meeting, index) => (
                           <UpcomingMeetingCard key={index} {...meeting} />
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="invited">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-4">
                        {invitedMeetings.map((meeting, index) => (
                            <InvitedMeetingCard key={index} {...meeting} />
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="my-meetings">
                     <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-4">
                        {myMeetings.map((meeting, index) => (
                           <MyMeetingCard key={index} {...meeting} />
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="ended">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-4">
                        {endedMeetings.map((meeting, index) => (
                           <EndedMeetingCard key={index} {...meeting} />
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
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
                            <Button onClick={() => handleScheduleClick(suggestion)}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Schedule Meeting
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </CardContent>
        </Card>
      </main>
      <ScheduleMeetingDialog
            isOpen={isScheduleDialogOpen}
            onOpenChange={handleCloseDialog}
            suggestion={selectedSuggestion}
        />
    </AppLayout>
  );
}
