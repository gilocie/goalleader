
'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
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
        total: Math.floor(Math.random() * 20) + 10,
    }));
};

export function ProjectAnalyticsChart() {
  const [data, setData] = useState<any[]>([]);
  const [currentMonthIndex, setCurrentMonthIndex] = useState<number | null>(null);

  useEffect(() => {
    setData(generateData());
    setCurrentMonthIndex(new Date().getMonth());
  }, []);
  
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
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip
                contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                }}
            />
            <Bar
              dataKey="total"
              radius={[4, 4, 0, 0]}
            >
                {data.map((entry, index) => (
                    <rect
                        key={`cell-${index}`}
                        x={0}
                        y={0}
                        width={0}
                        height={0}
                        fill={index === currentMonthIndex ? 'hsl(var(--primary))' : 'hsl(var(--muted))'}
                    />
                ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
