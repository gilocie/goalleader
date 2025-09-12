
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
    const currentMonth = new Date().getMonth();
    return months.map((month, index) => ({
        name: month,
        total: index <= currentMonth ? Math.floor(Math.random() * 101) : null,
    }));
};

const getBarColor = (value: number | null) => {
    if (value === null || value < 50) {
        return 'hsl(var(--muted))';
    }
    return "url(#colorGradient)";
}

export function ProjectAnalyticsChart() {
  const [data, setData] = useState<any[]>([]);
  const [currentMonthIndex, setCurrentMonthIndex] = useState<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const barWidth = 40; 
  const visibleMonths = 4;
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const generatedData = generateData();
    setData(generatedData);
    const monthIndex = new Date().getMonth();
    setCurrentMonthIndex(monthIndex);
  }, []);

  useEffect(() => {
    if (scrollContainerRef.current && currentMonthIndex !== null) {
        const initialScrollPosition = Math.max(0, (currentMonthIndex - 1) * barWidth);
        scrollContainerRef.current.scrollLeft = initialScrollPosition;
    }
  }, [currentMonthIndex, data]);

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
                {currentYear}
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
          {currentYear}
        </CardDescription>
      </CardHeader>
      <CardContent className="relative flex items-center pr-8">
         <div className="h-[150px]">
            <ResponsiveContainer width={50} height="100%">
                <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 20 }}>
                     <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}%`}
                        domain={[0, 100]}
                        />
                </BarChart>
            </ResponsiveContainer>
         </div>
         <Button 
            variant="outline" 
            size="icon" 
            className="absolute -left-4 top-1/3 -translate-y-1/2 h-8 w-8 rounded-full z-10"
            onClick={() => handleScroll('left')}
            >
             <ChevronLeft className="h-4 w-4" />
        </Button>
        <div ref={scrollContainerRef} className="overflow-x-auto mx-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']" style={{width: `${visibleMonths * barWidth}px`}}>
            <ResponsiveContainer width={barWidth * 12} height={150}>
            <BarChart data={data} barGap={-barWidth / 2} barCategoryGap="20%" margin={{ top: 0, right: 0, left: 0, bottom: 20 }}>
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
                interval={0}
                padding={{ left: barWidth / 4, right: barWidth / 4 }}
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
                    formatter={(value: number) => value !== null ? [`${value}%`, 'Performance'] : ['No data', 'Performance']}
                    wrapperStyle={{ zIndex: 100 }}
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
            className="absolute -right-4 top-1/3 -translate-y-1/2 h-8 w-8 rounded-full z-10"
            onClick={() => handleScroll('right')}
            >
             <ChevronRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
