
'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useEffect, useState } from 'react';

const generateData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map(month => ({
        name: month,
        total: Math.floor(Math.random() * 101),
    }));
};

const getBarColor = (value: number) => {
    if (value >= 100) {
        return 'hsl(var(--primary))'; // dark green
    }
    if (value >= 50) {
        return 'hsl(var(--accent))'; // light green
    }
    return 'hsl(var(--muted))'; // gray
}

export function ProjectAnalyticsChart() {
  const [data, setData] = useState<any[]>([]);
  const [currentMonthIndex, setCurrentMonthIndex] = useState<number | null>(null);

  useEffect(() => {
    // This should run only on the client
    setData(generateData());
    setCurrentMonthIndex(new Date().getMonth());
  }, []);

  if (data.length === 0) {
    return (
        <Card className="h-[260px]">
            <CardHeader>
                <CardTitle>Performance Record</CardTitle>
                <CardDescription>
                Track staff performance based on daily completed tasks.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-center h-[150px]">
                    <p>Loading chart data...</p>
                </div>
            </CardContent>
        </Card>
    )
  }
  
  return (
    <Card className="h-[260px]">
      <CardHeader>
        <CardTitle>Performance Record</CardTitle>
        <CardDescription>
          Track staff performance based on daily completed tasks.
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={data}>
            <XAxis
              dataKey="name"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}%`}
              domain={[0, 100]}
            />
            <Tooltip
                contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                }}
                labelStyle={{
                    color: 'hsl(var(--foreground))'
                }}
                formatter={(value: number) => [`${value}%`, 'Performance']}
            />
            <Bar dataKey="total" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} background={{ fill: 'hsl(var(--border))', radius: 4 }} />
            <Bar
              dataKey="total"
              radius={[4, 4, 0, 0]}
            >
                {data.map((entry, index) => (
                    <Cell
                        key={`cell-${index}`}
                        fill={getBarColor(entry.total)}
                        stroke={index === currentMonthIndex ? 'hsl(var(--primary))' : 'transparent'}
                        strokeWidth={2}
                    />
                ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
