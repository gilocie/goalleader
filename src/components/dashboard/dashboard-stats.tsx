import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Package, CircleCheck, LoaderCircle, Hourglass } from 'lucide-react';

const stats = [
  {
    title: 'Total Projects',
    value: 50,
    icon: <Package className="h-4 w-4 text-muted-foreground" />,
  },
  {
    title: 'Ended Projects',
    value: 35,
    icon: <CircleCheck className="h-4 w-4 text-muted-foreground" />,
  },
  {
    title: 'Running Projects',
    value: 10,
    icon: <LoaderCircle className="h-4 w-4 text-muted-foreground" />,
  },
  {
    title: 'Pending Projects',
    value: 5,
    icon: <Hourglass className="h-4 w-4 text-muted-foreground" />,
  },
];

export function DashboardStats() {
  return (
    <>
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            {stat.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}
