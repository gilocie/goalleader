
'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const dailyData = [
  { name: 'Mon', value: 80 },
  { name: 'Tue', value: 92 },
  { name: 'Wed', value: 75 },
  { name: 'Thu', value: 88 },
  { name: 'Fri', value: 95 },
  { name: 'Sat', value: 60 },
  { name: 'Sun', value: 70 },
];

const weeklyData = [
    { name: 'W1', value: 85 },
    { name: 'W2', value: 88 },
    { name: 'W3', value: 90 },
    { name: 'W4', value: 82 },
];

const monthlyData = [
    { name: 'Jan', value: 88 },
    { name: 'Feb', value: 91 },
    { name: 'Mar', value: 85 },
    { name: 'Apr', value: 93 },
    { name: 'May', value: 89 },
    { name: 'Jun', value: 94 },
];

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
            <TabsTrigger value="yearly">Yearly</TabsTrigger>
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
