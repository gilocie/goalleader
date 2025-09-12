
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
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reminders</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {meetings.map((meeting, index) => (
          <div key={index} className="flex flex-col gap-2">
            <div className="space-y-1">
              <p className="text-lg font-semibold leading-none">
                {meeting.title}
              </p>
              <p className="text-sm text-muted-foreground">{meeting.time}</p>
            </div>
            {index === 0 && (
              <Button>
                <Video className="mr-2 h-4 w-4" /> Start Meeting
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
