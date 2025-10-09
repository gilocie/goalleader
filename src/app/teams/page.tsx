
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LayoutGrid, List, MessageSquare, Phone, Video, PlusCircle } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { useUser } from '@/context/user-context';

const allTeamMembers = [
  {
    id: 'patrick-achitabwino-m1',
    name: 'Patrick Achitabwino (You)',
    role: 'Team Leader',
    status: 'online' as const,
    department: 'Customer Service'
  },
  {
    id: 'frank-mhango-m2',
    name: 'Frank Mhango',
    role: 'Consultant',
    status: 'offline' as const,
    department: 'Customer Service'
  },
  {
    id: 'denis-maluwasa-m3',
    name: 'Denis Maluwasa',
    role: 'Consultant',
    status: 'online' as const,
    department: 'Customer Service'
  },
  {
    id: 'gift-banda-m4',
    name: 'Gift Banda',
    role: 'Consultant',
    status: 'online' as const,
    department: 'Engineering'
  },
  {
    id: 'chiyanjano-mkandawire-m5',
    name: 'Chiyanjano Mkandawire',
    role: 'Consultant',
    status: 'offline' as const,
    department: 'Engineering'
  },
  {
    id: 'wezi-chisale-m6',
    name: 'Wezi Chisale',
    role: 'Consultant',
    status: 'online' as const,
    department: 'Marketing'
  },
  {
    id: 'charity-moyo-m7',
    name: 'Charity Moyo',
    role: 'Consultant',
    status: 'offline' as const,
    department: 'Marketing'
  },
  {
    id: 'fumbani-mwenefumbo-m8',
    name: 'Fumbani Mwenefumbo',
    role: 'Consultant',
    status: 'online' as const,
    department: 'ICT'
  },
  {
    id: 'rose-kabudula-m9',
    name: 'Rose Kabudula',
    role: 'Consultant',
    status: 'online' as const,
    department: 'ICT'
  },
];

export default function TeamsPage() {
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const { user } = useUser();

  const teamMembers = user.role === 'Admin'
    ? allTeamMembers
    : allTeamMembers.filter(member => member.department === user.department);

  const otherTeamMembers = teamMembers.filter(member => !member.name.includes('(You)'));

  return (
    <AppLayout>
      <main className="flex-grow p-4 md:p-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Our Team</CardTitle>
              <CardDescription>{user.role === 'Admin' ? 'All Departments' : user.department}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
                <TooltipProvider>
                     <Tooltip>
                        <TooltipTrigger asChild>
                            <Button>
                                <PlusCircle className="mr-2 h-4 w-4" /> Create New Team
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Create a new team</TooltipContent>
                    </Tooltip>
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
                <ScrollArea className="h-[400px] p-4">
                    <div
                    className={cn(
                        'transition-all duration-300',
                        layout === 'grid'
                        ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'
                        : 'flex flex-col gap-4'
                    )}
                    >
                    {otherTeamMembers.map((member) => {
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
                                <AvatarImage src={avatar?.imageUrl} alt={member.name} data-ai-hint={avatar?.imageHint} className="object-cover" />
                                <AvatarFallback>
                                {member.name.split(' ').map((n) => n[0]).join('')}
                                </AvatarFallback>
                            </Avatar>
                            <div className={cn(layout === 'grid' ? 'space-y-2' : 'flex-grow')}>
                                <p className="font-semibold">{member.name}</p>
                                <p className="text-sm text-muted-foreground">{member.role}</p>
                                {layout === 'grid' && (
                                <Button asChild size="sm">
                                    <Link href={`/teams/${member.id}`}>View Performance</Link>
                                </Button>
                                )}
                            </div>
                            {layout === 'list' && (
                                <Button asChild size="sm">
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
