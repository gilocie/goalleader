'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useEffect, useState } from 'react';

type CircularProgressBarProps = {
  progress: number;
};

const CircularProgressBar = ({ progress }: CircularProgressBarProps) => {
  const radius = 80;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg
        height={radius * 2}
        width={radius * 2}
        className="-rotate-90 transition-transform duration-500"
      >
        <circle
          stroke="hsl(var(--muted))"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke="hsl(var(--primary))"
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset, strokeLinecap: 'round' }}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-bold text-primary">{`${Math.round(
          progress
        )}%`}</span>
        <p className="text-xs text-muted-foreground">Completed</p>
      </div>
    </div>
  );
};

export function ProjectProgress() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Animate progress on mount
        const timer = setTimeout(() => setProgress(75), 200);
        return () => clearTimeout(timer);
    }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Progress</CardTitle>
        <CardDescription>Overall completion status</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center p-6">
        <CircularProgressBar progress={progress} />
      </CardContent>
    </Card>
  );
}
