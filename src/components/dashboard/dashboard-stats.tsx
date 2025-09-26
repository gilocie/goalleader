
'use client';

import { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { useIsMobileOrTablet } from '@/hooks/use-mobile';
import { useTimeTracker } from '@/context/time-tracker-context';

export function DashboardStats() {
  const [openCard, setOpenCard] = useState<string | null>(null);
  const isMobileOrTablet = useIsMobileOrTablet();
  const { tasks } = useTimeTracker();

  const stats = useMemo(() => {
    const totalProjects = tasks.length;
    const endedProjects = tasks.filter(t => t.status === 'Completed').length;
    const runningProjects = tasks.filter(t => t.status === 'In Progress').length;
    const pendingProjects = tasks.filter(t => t.status === 'Pending').length;

    return [
      {
        title: 'Total Projects',
        value: totalProjects,
        description: 'All tasks created.',
      },
      {
        title: 'Ended Projects',
        value: endedProjects,
        description: 'Tasks marked as "Completed".',
      },
      {
        title: 'Running Projects',
        value: runningProjects,
        description: 'Tasks currently "In Progress".',
      },
      {
        title: 'Pending Projects',
        value: pendingProjects,
        description: 'Tasks waiting to be started.',
      },
    ];
  }, [tasks]);


  const toggleCard = (title: string) => {
    setOpenCard(prev => prev === title ? null : title);
  }

  const isCardOpen = (title: string) => {
    if (!isMobileOrTablet) return true;
    return openCard === title;
  };

  return (
    <>
      {stats.map((stat) => (
        <Collapsible 
          key={stat.title} 
          open={isCardOpen(stat.title)}
          onOpenChange={isMobileOrTablet ? () => toggleCard(stat.title) : undefined}
          asChild
        >
            <Card className="relative bg-primary text-primary-foreground p-4 flex flex-col justify-between">
             <div className="flex justify-between items-start">
                <CardTitle className="text-base font-medium">{stat.title}</CardTitle>
                <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-full bg-white/20 text-white hover:bg-white/30 flex-shrink-0"
                >
                    <ArrowUpRight className="h-4 w-4" />
                </Button>
             </div>

             <div>
                <div className="text-4xl font-bold">{stat.value}</div>
                <CollapsibleContent>
                    <p className="text-xs text-green-100 mt-1">{stat.description}</p>
                </CollapsibleContent>
             </div>
            
            {isMobileOrTablet && (
              <CollapsibleTrigger asChild>
                  <button 
                  className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-green-800 text-white flex items-center justify-center"
                  >
                      {openCard === stat.title ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
              </CollapsibleTrigger>
            )}
            </Card>
        </Collapsible>
      ))}
    </>
  );
}
