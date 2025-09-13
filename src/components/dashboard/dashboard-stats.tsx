
'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowUpRight, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';

const stats = [
  {
    title: 'Total Projects',
    value: 24,
    trend: {
      value: 5,
      direction: 'increase',
      label: 'Increased from last month',
    },
  },
  {
    title: 'Ended Projects',
    value: 18,
    trend: {
      value: 3,
      direction: 'increase',
      label: 'Increased from last month',
    },
  },
  {
    title: 'Running Projects',
    value: 5,
    trend: {
      value: 2,
      direction: 'decrease',
      label: 'Decreased from last month',
    },
  },
  {
    title: 'Pending Projects',
    value: 1,
    trend: {
      value: 1,
      direction: 'increase',
      label: 'Increased from last month',
    },
  },
];

export function DashboardStats() {
  const [openCard, setOpenCard] = useState<string | null>(null);

  const toggleCard = (title: string) => {
    setOpenCard(prev => prev === title ? null : title);
  }

  return (
    <>
      {stats.map((stat) => (
        <Collapsible key={stat.title} open={openCard === stat.title} onOpenChange={() => toggleCard(stat.title)} asChild>
            <Card
            className="bg-gradient-to-br from-primary to-green-700 text-primary-foreground"
            >
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className='flex flex-col'>
                    <CardTitle className="text-base font-bold">{stat.title}</CardTitle>
                    <div className="flex items-end gap-2">
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <CollapsibleTrigger asChild>
                            <button className="flex items-center gap-1" >
                                <div className="flex items-center gap-1 rounded-full bg-white/20 px-2 py-1 text-xs">
                                    <ArrowUp className="h-3 w-3" />
                                    <span>{stat.trend.value}</span>
                                </div>
                                {openCard === stat.title ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </button>
                        </CollapsibleTrigger>
                    </div>
                </div>
                <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 rounded-full bg-white/20 text-white hover:bg-white/30 flex-shrink-0"
                >
                <ArrowUpRight className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent className='pt-0'>
                 <CollapsibleContent>
                    <p className="text-xs text-green-100 mt-2">{stat.trend.label}</p>
                </CollapsibleContent>
            </CardContent>
            </Card>
        </Collapsible>
      ))}
    </>
  );
}
