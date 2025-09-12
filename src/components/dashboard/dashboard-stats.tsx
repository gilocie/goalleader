
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowUpRight } from 'lucide-react';

const stats = [
  {
    title: 'Total Projects',
    value: 24,
    trend: {
      value: 5,
      direction: 'increase',
      label: 'Increased from last month',
    },
  },
  {
    title: 'Ended Projects',
    value: 18,
    trend: {
      value: 3,
      direction: 'increase',
      label: 'Increased from last month',
    },
  },
  {
    title: 'Running Projects',
    value: 5,
    trend: {
      value: 2,
      direction: 'decrease',
      label: 'Decreased from last month',
    },
  },
  {
    title: 'Pending Projects',
    value: 1,
    trend: {
      value: 1,
      direction: 'increase',
      label: 'Increased from last month',
    },
  },
];

export function DashboardStats() {
  return (
    <>
      {stats.map((stat) => (
        <Card
          key={stat.title}
          className="bg-gradient-to-br from-primary to-green-700 text-primary-foreground"
        >
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-bold">{stat.title}</CardTitle>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full bg-white/20 text-white hover:bg-white/30"
            >
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold">{stat.value}</div>
            <div className="mt-4 flex items-center gap-2">
              <div className="flex items-center gap-1 rounded-full bg-white/20 px-2 py-1 text-xs">
                <ArrowUp className="h-3 w-3" />
                <span>{stat.trend.value}</span>
              </div>
              <p className="text-xs text-green-100">{stat.trend.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}
