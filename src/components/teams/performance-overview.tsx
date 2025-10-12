
'use client';

import { useMemo } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTimeTracker } from '@/context/time-tracker-context';
import { eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, format, getDay, getWeek, getMonth } from 'date-fns';

const Chart = ({ data }: { data: {name: string, value: number}[] }) => (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
        <Tooltip
            cursor={{ fill: 'hsl(var(--accent))', opacity: 0.5 }}
            contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
        />
        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
);


export function PerformanceOverview() {
  const { tasks } = useTimeTracker();

  const completedTasks = useMemo(() => tasks.filter(task => task.status === 'Completed' && task.endTime), [tasks]);

  const dailyData = useMemo(() => {
    const now = new Date();
    const lastSevenDays = eachDayOfInterval({ start: startOfWeek(now), end: endOfWeek(now) });
    return lastSevenDays.map(day => {
        const dayTasks = tasks.filter(task => new Date(task.dueDate).toDateString() === day.toDateString());
        const completedDayTasks = completedTasks.filter(task => new Date(task.dueDate).toDateString() === day.toDateString());
        const percentage = dayTasks.length > 0 ? (completedDayTasks.length / dayTasks.length) * 100 : 0;
        return { name: format(day, 'EEE'), value: Math.round(percentage) };
    });
  }, [tasks, completedTasks]);

  const weeklyData = useMemo(() => {
      const now = new Date();
      const lastFourWeeks = eachWeekOfInterval({ start: startOfMonth(now), end: endOfMonth(now) });
      return lastFourWeeks.map((week, index) => {
          const weekTasks = tasks.filter(task => {
              const taskWeek = getWeek(new Date(task.dueDate));
              return taskWeek === getWeek(week);
          });
          const completedWeekTasks = completedTasks.filter(task => {
              const taskWeek = getWeek(new Date(task.dueDate));
              return taskWeek === getWeek(week);
          });
          const percentage = weekTasks.length > 0 ? (completedWeekTasks.length / weekTasks.length) * 100 : 0;
          return { name: `W${index + 1}`, value: Math.round(percentage) };
      });
  }, [tasks, completedTasks]);

  const monthlyData = useMemo(() => {
      const now = new Date();
      const yearStart = new Date(now.getFullYear(), 0, 1);
      const months = eachMonthOfInterval({ start: yearStart, end: now });
      return months.map(month => {
          const monthTasks = tasks.filter(task => getMonth(new Date(task.dueDate)) === getMonth(month));
          const completedMonthTasks = completedTasks.filter(task => getMonth(new Date(task.dueDate)) === getMonth(month));
          const percentage = monthTasks.length > 0 ? (completedMonthTasks.length / monthTasks.length) * 100 : 0;
          return { name: format(month, 'MMM'), value: Math.round(percentage) };
      });
  }, [tasks, completedTasks]);


  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Overview</CardTitle>
        <CardDescription>Progress across different timeframes.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="weekly">
          <TabsList>
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly" disabled>Yearly</TabsTrigger>
          </TabsList>
          <TabsContent value="daily">
            <Chart data={dailyData} />
          </TabsContent>
          <TabsContent value="weekly">
            <Chart data={weeklyData} />
          </TabsContent>
          <TabsContent value="monthly">
            <Chart data={monthlyData} />
          </TabsContent>
          <TabsContent value="yearly">
            <div className="flex items-center justify-center h-[300px]">
                <p className="text-muted-foreground">Yearly data coming soon.</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
