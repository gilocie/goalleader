
'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, Defs, LinearGradient, Stop } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useEffect, useState, useRef } from 'react';
import { Button } from '../ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const generateData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map(month => ({
        name: month,
        total: Math.floor(Math.random() * 101),
    }));
};

const getBarColor = (value: number) => {
    if (value >= 50) {
        return "url(#colorGradient)";
    }
    return 'hsl(var(--muted))'; // gray
}

export function ProjectAnalyticsChart() {
  const [data, setData] = useState<any[]>([]);
  const [currentMonthIndex, setCurrentMonthIndex] = useState<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const barWidth = 35; // Includes gap
  const visibleMonths = 4;

  useEffect(() => {
    // This should run only on the client
    const generatedData = generateData();
    setData(generatedData);
    const monthIndex = new Date().getMonth();
    setCurrentMonthIndex(monthIndex);

    if (scrollContainerRef.current) {
        const initialScrollPosition = Math.max(0, (monthIndex - 1) * barWidth);
        scrollContainerRef.current.scrollLeft = initialScrollPosition;
    }
  }, []);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
        const scrollAmount = visibleMonths * barWidth;
        scrollContainerRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth'
        });
    }
  }

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
      <CardContent className="pl-2 relative">
         <Button 
            variant="outline" 
            size="icon" 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-6 z-10"
            onClick={() => handleScroll('left')}
            >
             <ChevronLeft className="h-4 w-4" />
        </Button>
        <div ref={scrollContainerRef} className="overflow-x-auto" style={{width: `${visibleMonths * barWidth}px`}}>
            <ResponsiveContainer width={barWidth * 12} height={150}>
            <BarChart data={data} barGap={-barWidth / 2} barCategoryGap="20%">
                <defs>
                <linearGradient id="colorGradient" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="hsl(var(--accent))" />
                    <stop offset="100%" stopColor="hsl(var(--primary))" />
                </linearGradient>
                </defs>
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
                <Bar
                dataKey="total"
                radius={[4, 4, 0, 0]}
                background={{ fill: 'hsl(var(--border))', radius: 4 }}
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
        </div>
        <Button 
            variant="outline" 
            size="icon" 
            className="absolute right-0 top-1/2 -translate-y-1/2 h-6 w-6 z-10"
            onClick={() => handleScroll('right')}
            >
             <ChevronRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
