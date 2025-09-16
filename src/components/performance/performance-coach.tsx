
'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import { useTimeTracker } from '@/context/time-tracker-context';
import { getPerformanceAdvice, PerformanceAdviceInput, PerformanceAdviceOutput } from '@/ai/flows/performance-advice-flow';
import { Loader2 } from 'lucide-react';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';

const COMPANY_KPI = 80; // 80% completion rate as the target

export function PerformanceCoach() {
  const { tasks } = useTimeTracker();
  const [advice, setAdvice] = useState<PerformanceAdviceOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const completedTasks = tasks.filter((t) => t.status === 'Completed');
  const performance =
    tasks.length > 0
      ? Math.round((completedTasks.length / tasks.length) * 100)
      : 0;

  useEffect(() => {
    const fetchAdvice = async () => {
      setIsLoading(true);
      try {
        const input: PerformanceAdviceInput = {
          completedTasks: completedTasks.map(t => ({ name: t.name, status: t.status, dueDate: t.dueDate, duration: t.duration })),
          kpi: COMPANY_KPI,
          performance,
        };
        const response = await getPerformanceAdvice(input);
        setAdvice(response);
      } catch (error) {
        console.error('Failed to get performance advice:', error);
        setAdvice({
            title: 'Performance Analysis',
            advice: 'Start completing tasks to get personalized performance feedback.'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdvice();
  }, [tasks]);

  const getPerformanceInfo = () => {
    if (performance >= COMPANY_KPI) return {
        badge: <Badge variant="outline" className="bg-transparent text-primary border-primary">Excellent</Badge>,
        emoji: '🚀',
        titleClass: 'text-primary',
        gradient: 'bg-gradient-to-br from-primary to-green-800 text-primary-foreground',
    };
    if (performance >= COMPANY_KPI / 2) return {
        badge: <Badge variant="outline" className="bg-transparent text-secondary-foreground border-secondary-foreground/50">Good</Badge>,
        emoji: '👍',
        titleClass: 'text-secondary-foreground',
        gradient: 'bg-gradient-to-br from-primary to-green-800 text-primary-foreground',
    };
    return {
        badge: <Badge variant="destructive">Needs Improvement</Badge>,
        emoji: '🤔',
        titleClass: 'text-destructive',
        gradient: 'bg-gradient-to-br from-primary to-green-800 text-primary-foreground',
    };
  };

  const { badge, emoji, titleClass, gradient } = getPerformanceInfo();

  return (
    <Card className="h-full max-h-[460px] flex flex-col">
       <CardHeader>
        <div className={cn("flex items-center justify-center text-center p-4 rounded-lg", gradient)}>
            <div className='flex flex-col items-center gap-2'>
                <div className="flex items-center gap-2">
                    <span className="text-2xl">{emoji}</span>
                    {badge}
                </div>
            </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4 text-left flex-1 flex flex-col min-h-0">
             <h3 className={cn("text-xl font-semibold text-center", advice?.title === 'Performance Analysis' ? 'text-muted-foreground' : titleClass)}>
                {advice?.title}
            </h3>
            <ScrollArea className="flex-1 pr-4">
                <div className="prose prose-sm max-w-none text-muted-foreground prose-headings:font-semibold prose-headings:text-card-foreground prose-strong:text-card-foreground">
                  <ReactMarkdown>{advice?.advice || ''}</ReactMarkdown>
                </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
