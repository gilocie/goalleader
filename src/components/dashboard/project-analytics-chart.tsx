
'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, Defs, LinearGradient, Stop, LabelList } from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useEffect, useState, useRef } from 'react';
import { Button } from '../ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useIsMobileOrTablet } from '@/hooks/use-mobile';

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

const CustomizedLabel = (props: any) => {
    const { x, y, width, value } = props;
    const isMobileOrTablet = useIsMobileOrTablet();
    
    // Always position the label in the middle of the bar's potential height
    const yPos = y + (150 - 20) / 2; // (chart height - top margin) / 2

    const fill = (value ?? 0) < 50 ? "hsl(var(--foreground))" : "hsl(var(--primary-foreground))";
  
    return (
      <text
        x={x + width / 2}
        y={yPos}
        fill={fill}
        textAnchor="middle"
        dominantBaseline="middle"
        className="text-xs font-semibold"
        transform={`rotate(-90, ${x + width / 2}, ${yPos})`}
      >
        {value !== null ? `${value}%` : ''}
      </text>
    );
};

export function ProjectAnalyticsChart() {
  const [data, setData] = useState<any[]>([]);
  const [currentMonthIndex, setCurrentMonthIndex] = useState<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isMobileOrTablet = useIsMobileOrTablet();
  const barWidth = isMobileOrTablet ? 28 : 40; 
  const visibleMonths = 4;
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const generatedData = generateData();
    setData(generatedData);
    const monthIndex = new Date().getMonth();
    setCurrentMonthIndex(monthIndex);
  }, []);

  useEffect(() => {
    if (scrollContainerRef.current && currentMonthIndex !== null && !isMobileOrTablet) {
        const initialScrollPosition = Math.max(0, (currentMonthIndex - 1) * barWidth);
        scrollContainerRef.current.scrollLeft = initialScrollPosition;
    }
  }, [currentMonthIndex, data, isMobileOrTablet, barWidth]);

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
                <div className="text-sm text-muted-foreground">{currentYear}</div>
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
    <Card className="h-[260px] overflow-hidden relative">
        {!isMobileOrTablet && <Button 
            variant="default"
            size="icon" 
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 h-8 w-8 rounded-full z-10 bg-green-800 hover:bg-green-700"
            onClick={() => handleScroll('left')}
            >
             <ChevronLeft className="h-4 w-4" />
        </Button>}
      <CardHeader>
        <CardTitle>Performance Record</CardTitle>
        <div className="text-sm text-muted-foreground">{currentYear}</div>
      </CardHeader>
      <CardContent className="flex items-center pr-0 sm:pr-4">
         <div className="h-[150px] -ml-2">
            <ResponsiveContainer width={50} height="100%">
                <BarChart data={data} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
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
        <div ref={scrollContainerRef} className={`overflow-x-auto mx-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']`} style={!isMobileOrTablet ? {width: `${visibleMonths * barWidth}px`} : {width: '100%'}}>
            <ResponsiveContainer width={isMobileOrTablet ? '100%' : barWidth * 12} height={150}>
            <BarChart data={data} barGap={isMobileOrTablet ? 0 : -barWidth / 2} barCategoryGap="20%" margin={{ top: 20, right: 0, left: 0, bottom: 5 }}>
                <defs>
                <linearGradient id="colorGradient" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="hsl(var(--accent))" />
                    <stop offset="100%" stopColor="hsl(var(--primary))" />
                </linearGradient>
                </defs>
                <Tooltip 
                    cursor={{fill: 'hsl(var(--accent))', opacity: 0.5}}
                    contentStyle={{ zIndex: 100 }}
                    position={{ y: 0 }}
                />
                <XAxis
                dataKey="name"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                interval={0}
                padding={{ left: isMobileOrTablet ? 4 : barWidth/4, right: isMobileOrTablet ? 4 : barWidth/4 }}
                />
                <Bar
                    dataKey="total"
                    radius={[4, 4, 0, 0]}
                    background={{ fill: 'hsl(var(--border))', radius: 4 }}
                >
                    <LabelList dataKey="total" content={<CustomizedLabel />} />
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
      </CardContent>
      {!isMobileOrTablet && <Button 
            variant="default" 
            size="icon" 
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 h-8 w-8 rounded-full z-10 bg-green-800 hover:bg-green-700"
            onClick={() => handleScroll('right')}
            >
             <ChevronRight className="h-4 w-4" />
        </Button>}
    </Card>
  );
}
