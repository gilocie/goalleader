
'use client';

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
import { useTimeTracker } from '@/context/time-tracker-context';
import { cn } from '@/lib/utils';

interface TimeTrackerProps {
  isMobileFooter?: boolean;
  layout?: 'card' | 'inline';
}

export function TimeTracker({ isMobileFooter = false, layout = 'card' }: TimeTrackerProps) {
  const { time, isActive, activeTask, handleStartStop, tasks, setCompleteTaskOpen, setSelectedTask } = useTimeTracker();
  const timeTrackerBg = PlaceHolderImages.find((img) => img.id === 'time-tracker-bg');

  const formatTime = (seconds: number) => {
    const getSeconds = `0${seconds % 60}`.slice(-2);
    const minutes = Math.floor(seconds / 60);
    const getMinutes = `0${minutes % 60}`.slice(-2);
    const getHours = `0${Math.floor(seconds / 3600)}`.slice(-2);

    return `${getHours}:${getMinutes}:${getSeconds}`;
  };

  const handleStopClick = () => {
    if (activeTask) {
        const task = tasks.find(t => t.id === activeTask);
        if (task) {
            setSelectedTask(task);
            setCompleteTaskOpen(true);
        }
    }
  };


  if (isMobileFooter) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-card border-t p-2 md:hidden">
        <div className="flex items-center justify-between gap-4">
            <div className='flex flex-col'>
                <span className="text-sm font-semibold">{activeTask ? tasks.find(t=>t.id === activeTask)?.name : "No active task"}</span>
                <span className="text-2xl font-bold font-mono tabular-nums">
                    {formatTime(time)}
                </span>
            </div>
          <div className="flex gap-2">
            <Button
              onClick={handleStartStop}
              size="icon"
              variant="outline"
              aria-label={isActive ? 'Pause timer' : 'Start timer'}
              className="w-12 h-12 rounded-full"
              disabled={!activeTask && tasks.filter(t => t.status === 'Pending').length === 0}
            >
              {isActive ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </Button>
            <Button
              onClick={handleStopClick}
              variant="destructive"
              size="icon"
              aria-label="Stop timer"
              className="w-12 h-12 rounded-full"
              disabled={!isActive}
            >
              <Square className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (layout === 'inline') {
    return (
        <div className="relative rounded-lg overflow-hidden text-white">
            {timeTrackerBg && (
                <Image
                    src={timeTrackerBg.imageUrl}
                    alt={timeTrackerBg.description}
                    data-ai-hint={timeTrackerBg.imageHint}
                    fill
                    className="object-cover z-0"
                />
            )}
            <div className="relative z-10 flex items-center gap-2 bg-green-900/50 px-2 py-1">
                <div className="flex flex-col">
                    <span className="text-xs text-white/80 font-medium truncate max-w-24">{activeTask ? tasks.find(t=>t.id === activeTask)?.name : "No active task"}</span>
                    <span className="text-lg font-bold font-mono tabular-nums leading-tight">{formatTime(time)}</span>
                </div>
                <div className="flex items-center gap-1">
                <Button
                    onClick={handleStartStop}
                    size="icon"
                    variant="ghost"
                    aria-label={isActive ? 'Pause timer' : 'Start timer'}
                    className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30"
                    disabled={!activeTask && tasks.filter(t => t.status === 'Pending').length === 0}
                >
                    {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button
                    onClick={handleStopClick}
                    variant="destructive"
                    size="icon"
                    aria-label="Stop timer"
                    className="w-7 h-7 rounded-full"
                    disabled={!isActive}
                >
                    <Square className="h-4 w-4" />
                </Button>
                </div>
            </div>
        </div>
    );
  }

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
      <div className="relative z-10 bg-green-900/50 p-2 h-full flex flex-col justify-between">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-0">
          <CardTitle className="text-xs font-medium">Time Tracker</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-1 p-0">
          <div className="text-2xl font-bold font-mono tabular-nums">
            {formatTime(time)}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleStartStop}
              size="icon"
              variant="ghost"
              aria-label={isActive ? 'Pause timer' : 'Start timer'}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30"
              disabled={!activeTask && tasks.filter(t => t.status === 'Pending').length === 0}
            >
              {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button
              onClick={handleStopClick}
              variant="destructive"
              size="icon"
              aria-label="Stop timer"
              className="w-8 h-8 rounded-full"
              disabled={!isActive}
            >
              <Square className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
