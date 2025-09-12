
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

const generateData = () => {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const currentMonth = new Date().getMonth();
  return months.map((month, index) => ({
    name: month,
    total: index <= currentMonth ? Math.floor(Math.random() * 101) : null,
  }));
};

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

  const insideThreshold = 18; // min bar height to render label inside
  const text = `${value}%`;
  const cx = x + width / 2;

  if (height >= insideThreshold) {
    // inside the bar, choose white or dark depending on fill contrast
    const fill = (value ?? 0) < 50 ? 'hsl(var(--foreground))' : 'white';
    return (
      <text
        x={cx}
        y={y + height / 2}
        fill={fill}
        textAnchor="middle"
        dominantBaseline="middle"
        className="text-[10px] font-bold"
      >
        {text}
      </text>
    );
  }

  // small bar -> render label just above the bar
  const aboveY = Math.max(4, y - 6); // ensure we don't go negative
  return (
    <text
      x={cx}
      y={aboveY}
      fill="hsl(var(--muted-foreground))"
      textAnchor="middle"
      dominantBaseline="baseline"
      className="text-[10px] font-medium"
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
  const barWidth = isMobileOrTablet ? 28 : 40;
  const visibleMonths = 4;
  const currentYear = new Date().getFullYear();

  // ticks every 10% (0,10,20,...100)
  const yTicks = Array.from({ length: 11 }, (_, i) => i * 10);

  useEffect(() => {
    const generatedData = generateData();
    setData(generatedData);
    setCurrentMonthIndex(new Date().getMonth());
  }, []);

  useEffect(() => {
    if (scrollContainerRef.current && currentMonthIndex !== null && !isMobileOrTablet) {
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
    <Card className="h-[310px] overflow-visible">
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
          style={!isMobileOrTablet ? { width: `${visibleMonths * barWidth}px` } : {}}
        >
          <ResponsiveContainer width={isMobileOrTablet ? '100%' : barWidth * 12} height={chartHeight}>
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
                padding={{ left: isMobileOrTablet ? 4 : 8, right: isMobileOrTablet ? 4 : 8 }}
              />

              <Bar dataKey="total" radius={[6, 6, 0, 0]} background={{ fill: 'hsl(var(--border))', radius: 4 }} barSize={barWidth}>
                {/* Use function/Component reference for label content */}
                <LabelList dataKey="total" content={CustomizedLabel as any} />
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
