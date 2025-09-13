
'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { useTimeTracker } from '@/context/time-tracker-context';
import { getPerformanceAdvice, PerformanceAdviceInput, PerformanceAdviceOutput } from '@/ai/flows/performance-advice-flow';
import { Bot, Loader2 } from 'lucide-react';
import { Badge } from '../ui/badge';

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
            title: 'Welcome!',
            advice: 'Start completing tasks to get personalized performance feedback.'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdvice();
  }, [tasks]);

  const getPerformanceBadge = () => {
    if (performance >= COMPANY_KPI) return <Badge variant="default">Excellent</Badge>;
    if (performance >= COMPANY_KPI / 2) return <Badge variant="secondary">Good</Badge>;
    return <Badge variant="destructive">Needs Improvement</Badge>;
  };

  return (
    <Card className="h-full max-h-[460px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot />
          AI Performance Coach
        </CardTitle>
        <CardDescription>
            Your AI assistant for performance feedback.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold">{advice?.title}</h3>
                {getPerformanceBadge()}
            </div>
            <p className="text-sm text-muted-foreground">
              {advice?.advice}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
