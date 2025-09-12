
'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Square } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';

export function TimeTracker() {
  const [time, setTime] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const timeTrackerBg = PlaceHolderImages.find((img) => img.id === 'time-tracker-bg');


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
    <Card className="relative text-white overflow-hidden">
        {timeTrackerBg && (
            <Image
                src={timeTrackerBg.imageUrl}
                alt={timeTrackerBg.description}
                data-ai-hint={timeTrackerBg.imageHint}
                fill
                className="object-cover z-0"
            />
        )}
      <div className="relative z-10 bg-black/30 p-4 h-full flex flex-col justify-between">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
          <CardTitle className="text-sm font-medium">Time Tracker</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-2 p-0">
          <div className="text-4xl font-bold font-mono tabular-nums">
            {formatTime(time)}
          </div>
          <div className="flex gap-4">
            <Button
              onClick={handleStartStop}
              size="icon"
              variant="ghost"
              aria-label={isActive ? 'Pause timer' : 'Start timer'}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30"
            >
              {isActive ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
            <Button
              onClick={handleReset}
              variant="destructive"
              size="icon"
              aria-label="Stop timer"
              className="w-10 h-10 rounded-full"
            >
              <Square className="h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
