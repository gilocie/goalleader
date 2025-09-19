
'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useTimeTracker } from '@/context/time-tracker-context';
import { useEffect, useState } from 'react';
import { isToday, parseISO } from 'date-fns';

type CircularProgressBarProps = {
  progress: number;
  rating: string;
};

const DAILY_GOAL = 5;

const CircularProgressBar = ({
  progress,
  rating,
}: CircularProgressBarProps) => {
  const radius = 60;
  const stroke = 10;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const getRatingColor = () => {
    if (rating === 'Excellent') return 'hsl(var(--primary))';
    if (rating === 'Good') return 'hsl(var(--chart-3))';
    return 'hsl(var(--destructive))';
  };

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
          stroke={getRatingColor()}
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
        <span
          className="text-3xl font-bold"
          style={{ color: getRatingColor() }}
        >
          {`${Math.round(progress)}%`}
        </span>
        <p className="text-xs text-muted-foreground">{rating}</p>
      </div>
    </div>
  );
};

export function ProjectProgress() {
  const { tasks } = useTimeTracker();
  const [progress, setProgress] = useState(0);
  const [rating, setRating] = useState('Poor');
  
  const todaysTasks = tasks.filter(t => t.dueDate && isToday(parseISO(t.dueDate)));
  const completedToday = todaysTasks.filter(t => t.status === 'Completed').length;
  const remainingToGoals = Math.max(0, DAILY_GOAL - todaysTasks.length);

  useEffect(() => {
    const totalTasksToday = todaysTasks.length > 0 ? todaysTasks.length : 1; // Avoid division by zero
    const performance = (completedToday / totalTasksToday) * 100;
    
    let newRating = 'Poor';
    if (performance >= 80) {
      newRating = 'Excellent';
    } else if (performance >= 50) {
      newRating = 'Good';
    }
    setRating(newRating);

    const newProgress = totalTasksToday > 0 ? (completedToday / Math.max(todaysTasks.length, DAILY_GOAL)) * 100 : 0;
    const timer = setTimeout(() => setProgress(Math.min(newProgress, 100)), 200);
    return () => clearTimeout(timer);
  }, [completedToday, todaysTasks.length]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Task Progress</CardTitle>
        <CardDescription>
          {completedToday} of {Math.max(todaysTasks.length, DAILY_GOAL)} tasks completed today. {remainingToGoals > 0 ? `${remainingToGoals} more to meet goal.` : 'Daily goal met!'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center p-6">
        <CircularProgressBar progress={progress} rating={rating} />
      </CardContent>
    </Card>
  );
}
