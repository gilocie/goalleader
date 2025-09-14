
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LayoutGrid, List, MessageSquare, Phone, Video } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';

const teamMembers = [
  {
    id: 'sophia-davis-m1',
    name: 'Sophia Davis',
    role: 'Lead Developer',
    status: 'online',
  },
  {
    id: 'liam-martinez-m2',
    name: 'Liam Martinez',
    role: 'Frontend Developer',
    status: 'offline',
  },
  {
    id: 'ava-wilson-m3',
    name: 'Ava Wilson',
    role: 'Backend Developer',
    status: 'online',
  },
  {
    id: 'noah-brown-m4',
    name: 'Noah Brown',
    role: 'UI/UX Designer',
    status: 'online',
  },
  {
    id: 'emma-johnson-m5',
    name: 'Emma Johnson',
    role: 'QA Engineer',
    status: 'offline',
  },
  {
    id: 'oliver-garcia-m6',
    name: 'Oliver Garcia',
    role: 'DevOps Engineer',
    status: 'online',
  },
  {
    id: 'charlotte-rodriguez-m7',
    name: 'Charlotte Rodriguez',
    role: 'Project Manager',
    status: 'offline',
  },
  {
    id: 'james-smith-m8',
    name: 'James Smith',
    role: 'Data Scientist',
    status: 'online',
  },
];

export default function TeamsPage() {
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');

  return (
    <AppLayout>
      <main className="flex-grow p-4 md:p-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Our Team</CardTitle>
              <CardDescription>Engineering department</CardDescription>
            </div>
            <div className="flex items-center gap-2">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="outline" size="icon" asChild>
                                <Link href="/chat">
                                    <MessageSquare className="h-4 w-4" />
                                    <span className="sr-only">Start Chat</span>
                                </Link>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Start Team Chat</TooltipContent>
                    </Tooltip>
                     <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="outline" size="icon">
                                <Video className="h-4 w-4" />
                                <span className="sr-only">Start Meeting</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Start Team Meeting</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
              <Separator orientation="vertical" className="h-6 mx-2" />
              <Button variant={layout === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setLayout('grid')}>
                <LayoutGrid className="h-4 w-4" />
                <span className="sr-only">Grid View</span>
              </Button>
              <Button variant={layout === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setLayout('list')}>
                <List className="h-4 w-4" />
                <span className="sr-only">List View</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <TooltipProvider>
                <ScrollArea className="h-[calc(100vh-140px)] p-4">
                    <div
                    className={cn(
                        'transition-all duration-300',
                        layout === 'grid'
                        ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'
                        : 'flex flex-col gap-4'
                    )}
                    >
                    {teamMembers.map((member) => {
                        const avatar = PlaceHolderImages.find((img) => img.id === member.id);
                        return (
                        <Card
                            key={member.id}
                            className="shadow-md transition-shadow hover:shadow-lg relative"
                        >
                            <div className="absolute top-3 left-3 flex items-center gap-2">
                                <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="outline" size="icon" className="h-7 w-7 rounded-full bg-background/70">
                                    <MessageSquare className="h-4 w-4 text-primary" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Send Message</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="outline" size="icon" className="h-7 w-7 rounded-full bg-background/70">
                                    <Phone className="h-4 w-4 text-primary" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Call</TooltipContent>
                                </Tooltip>
                            </div>
                            <div className={cn(
                                'absolute top-3 right-3 h-3 w-3 rounded-full border-2 border-background',
                                member.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                            )} />
                            <CardContent
                            className={cn(
                                'p-4 pt-12',
                                layout === 'grid' ? 'flex flex-col items-center text-center space-y-4' : 'flex items-center space-x-4'
                            )}
                            >
                            <Avatar className={cn(layout === 'grid' ? 'h-20 w-20' : 'h-12 w-12')}>
                                <AvatarImage src={avatar?.imageUrl} alt={member.name} data-ai-hint={avatar?.imageHint} />
                                <AvatarFallback>
                                {member.name.split(' ').map((n) => n[0]).join('')}
                                </AvatarFallback>
                            </Avatar>
                            <div className={cn(layout === 'grid' ? 'space-y-2' : 'flex-grow')}>
                                <p className="font-semibold">{member.name}</p>
                                <p className="text-sm text-muted-foreground">{member.role}</p>
                                {layout === 'grid' && (
                                <Button asChild size="sm" className="bg-gradient-to-r from-primary to-green-700 text-primary-foreground hover:from-primary/90 hover:to-green-700/90">
                                    <Link href={`/teams/${member.id}`}>View Performance</Link>
                                </Button>
                                )}
                            </div>
                            {layout === 'list' && (
                                <Button asChild size="sm" className="bg-gradient-to-r from-primary to-green-700 text-primary-foreground hover:from-primary/90 hover:to-green-700/90">
                                    <Link href={`/teams/${member.id}`}>View Performance</Link>
                                </Button>
                            )}
                            </CardContent>
                        </Card>
                        );
                    })}
                    </div>
                </ScrollArea>
            </TooltipProvider>
          </CardContent>
        </Card>
      </main>
    </AppLayout>
  );
}
