'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';

export function TimeTracker() {
  const [time, setTime] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive]);

  const handleStartStop = () => {
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setTime(0);
  };

  const formatTime = (seconds: number) => {
    const getSeconds = `0${seconds % 60}`.slice(-2);
    const minutes = Math.floor(seconds / 60);
    const getMinutes = `0${minutes % 60}`.slice(-2);
    const getHours = `0${Math.floor(seconds / 3600)}`.slice(-2);

    return `${getHours}:${getMinutes}:${getSeconds}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Time Tracker</CardTitle>
        <CardDescription>Track time spent on your projects.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center gap-4">
        <div className="text-5xl font-bold font-mono text-foreground tabular-nums">
          {formatTime(time)}
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleStartStop}
            size="lg"
            aria-label={isActive ? 'Pause timer' : 'Start timer'}
            className="w-24"
          >
            {isActive ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
            size="lg"
            aria-label="Reset timer"
            className="w-24"
          >
            <RotateCcw className="h-6 w-6" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
