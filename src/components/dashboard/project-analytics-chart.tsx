
'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, CartesianGrid, LabelList } from 'recharts';
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

const staticData = [
  { name: 'Jan', total: null },
  { name: 'Feb', total: 74 },
  { name: 'Mar', total: 32 },
  { name: 'Apr', total: 37 },
  { name: 'May', total: 58 },
  { name: 'Jun', total: 92 },
  { name: 'Jul', total: 34 },
  { name: 'Aug', total: 18 },
  { name: 'Sep', total: 5 },
  { name: 'Oct', total: null },
  { name: 'Nov', total: null },
  { name: 'Dec', total: null },
];

const getBarColor = (value: number | null) => {
  if (value === null || value < 50) return 'hsl(var(--muted))';
  return "url(#colorGradient)";
}

/** CustomizedLabel: centers value inside bar if there's room,
 * otherwise places a small label above the bar so it remains readable.
 */
const CustomizedLabel = (props: any) => {
  const { x, y, width, height, value } = props;
  if (value === null || typeof value === 'undefined') return null;

  const text = `${value}%`;
  const cx = x + width / 2;
  const isHighBar = value >= 50;

  // Render label inside the bar
  const fill = isHighBar ? 'white' : 'hsl(var(--foreground))';
  const labelY = isHighBar ? y + 15 : y - 6;

  return (
    <text
      x={cx}
      y={labelY}
      fill={fill}
      textAnchor="middle"
      dominantBaseline={isHighBar ? "middle" : "baseline"}
      className="text-[10px] font-bold"
    >
      {text}
    </text>
  );
};


export function ProjectAnalyticsChart() {
  const [data, setData] = useState<any[]>([]);
  const [currentMonthIndex, setCurrentMonthIndex] = useState<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isMobileOrTablet = useIsMobileOrTablet();

  // CHART CONFIG
  const chartHeight = 200;             // inner drawing height for both charts
  const chartMargin = { top: 20, right: 0, left: 0, bottom: 5 };
  const barWidth = 40;
  const visibleMonths = isMobileOrTablet ? 6 : 4;
  const currentYear = 2025;

  // ticks every 20% (0, 20, 40, ...100)
  const yTicks = Array.from({ length: 6 }, (_, i) => i * 20);

  useEffect(() => {
    setData(staticData);
    setCurrentMonthIndex(new Date().getMonth());
  }, []);

  useEffect(() => {
    if (scrollContainerRef.current && currentMonthIndex !== null) {
      const initialScrollPosition = Math.max(0, (currentMonthIndex - 1) * barWidth);
      scrollContainerRef.current.scrollLeft = initialScrollPosition;
    }
  }, [currentMonthIndex, data, isMobileOrTablet, barWidth]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = visibleMonths * barWidth;
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  if (!data.length) {
    return (
      <Card className="h-[310px]">
        <CardHeader>
          <CardTitle>Performance Record</CardTitle>
          <div className="text-sm text-muted-foreground">{currentYear}</div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[200px]">
            <p>Loading chart data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[310px]">
      <CardHeader>
        <CardTitle>Performance Record</CardTitle>
        <div className="text-sm text-muted-foreground">{currentYear}</div>
      </CardHeader>

      <CardContent className="flex items-center pr-0 sm:pr-4 relative">
        {/* left Y axis: small fixed width chart to render ticks and grid lines */}
        <div style={{ width: 60, height: chartHeight }}>
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart data={data} margin={chartMargin}>
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}%`}
                domain={[0, 100]}
                ticks={yTicks}
              />
              {/* Render only horizontal grid lines to visually align with bars */}
              <CartesianGrid horizontal vertical={false} stroke="rgba(0,0,0,0.06)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* scrollable bar area */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-x-auto mx-auto [&::-webkit-scrollbar]:hidden"
          style={{ width: `${visibleMonths * barWidth}px` }}
        >
          <ResponsiveContainer width={barWidth * 12} height={chartHeight}>
            <BarChart data={data} barGap={0} margin={chartMargin}>
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="1" x2="0" y2="0">
                  <stop offset="0%" stopColor="hsl(var(--accent))" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" />
                </linearGradient>
              </defs>

              <Tooltip
                cursor={{ fill: 'hsl(var(--accent))', opacity: 0.3 }}
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
                padding={{ left: 8, right: 8 }}
              />

              <Bar dataKey="total" radius={[6, 6, 0, 0]} background={{ fill: 'hsl(var(--border))', radius: 4 }} barSize={barWidth}>
                {/* Use function/Component reference for label content */}
                <LabelList dataKey="total" content={CustomizedLabel as any} />
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getBarColor(entry.total)}
                    stroke={index === 8 ? 'hsl(var(--primary))' : 'transparent'} // Highlight September
                    strokeWidth={2}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* navigation buttons (desktop only) */}
        {!isMobileOrTablet && (
          <>
            <Button
              variant="default"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full z-10 bg-green-800 hover:bg-green-700"
              onClick={() => handleScroll('left')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="default"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full z-10 bg-green-800 hover:bg-green-700"
              onClick={() => handleScroll('right')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
