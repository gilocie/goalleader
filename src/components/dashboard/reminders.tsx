
import { Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const meetings = [
  {
    title: 'Meeting with Arc Company',
    time: '02:00 pm - 04:00 pm',
  },
  {
    title: 'Project Alpha Deadline',
    time: 'Due: 25th July',
  },
  {
    title: 'Design Review',
    time: '2:00 PM - 3:00 PM',
  },
];

export function Reminders() {
  const nextMeeting = meetings[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reminders</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {nextMeeting && (
          <div className="flex flex-col gap-2">
            <div className="space-y-1">
              <p className="text-lg font-semibold leading-none">
                {nextMeeting.title}
              </p>
              <p className="text-sm text-muted-foreground">{nextMeeting.time}</p>
            </div>
            <Button variant="primary-dark">
              <Video className="mr-2 h-4 w-4" /> Start Meeting
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
