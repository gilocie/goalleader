import { Bell, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const notifications = [
  {
    icon: <Calendar className="h-4 w-4 text-muted-foreground" />,
    title: 'Team Meeting',
    description: '10:00 AM - 11:00 AM',
  },
  {
    icon: <Calendar className="h-4 w-4 text-muted-foreground" />,
    title: 'Project Alpha Deadline',
    description: 'Due: 25th July',
  },
  {
    icon: <Calendar className="h-4 w-4 text-muted-foreground" />,
    title: 'Design Review',
    description: '2:00 PM - 3:00 PM',
  },
];

export function Reminders() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Reminders</CardTitle>
        <CardDescription>
          You have {notifications.length} upcoming events.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className=" flex items-center space-x-4 rounded-md border p-4">
          <Bell />
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">
              Push Notifications
            </p>
            <p className="text-sm text-muted-foreground">
              Send notifications to device.
            </p>
          </div>
          <Button variant="secondary" size="sm">
            Enable
          </Button>
        </div>
        {notifications.map((notification, index) => (
          <div
            key={index}
            className="mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0"
          >
            <span className="flex h-2 w-2 translate-y-1 rounded-full bg-primary" />
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">
                {notification.title}
              </p>
              <p className="text-sm text-muted-foreground">
                {notification.description}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
