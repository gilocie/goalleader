
'use client';

import { useState, useEffect } from 'react';
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

  const parseMarkdown = (text: string) => {
    if (!text) return { __html: '' };

    let html = text
      .replace(/^### (.*$)/gim, '<h3 class="font-semibold text-base mb-2">$1</h3>')
      .replace(/^\* (.*$)/gim, '<li class="ml-4 list-disc">$1</li>');

    // Wrap list items in a <ul>
    html = html.replace(/<li class="ml-4 list-disc">/g, '<ul><li class="ml-4 list-disc">');
    html = html.replace(/<\/li>(?!<li class="ml-4 list-disc">)/g, '</li></ul>');
    
    // Wrap non-tagged lines in <p>
    const lines = html.split('\n').map(line => {
      if (line.trim().startsWith('<h3') || line.trim().startsWith('<ul') || line.trim().startsWith('<li') || line.trim() === '</ul>' || line.trim() === '') {
        return line;
      }
      return `<p class="mb-2">${line}</p>`;
    });
    
    return { __html: lines.join('\n') };
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
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4 text-left flex-1 flex flex-col">
             <h3 className={cn("text-xl font-semibold text-center", advice?.title === 'Performance Analysis' ? 'text-muted-foreground' : titleClass)}>
                {advice?.title}
            </h3>
            <ScrollArea className="flex-1 pr-4">
                <div 
                    className="text-sm text-muted-foreground font-body"
                    dangerouslySetInnerHTML={parseMarkdown(advice?.advice || '')}
                />
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
