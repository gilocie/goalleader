
'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LayoutGrid, List } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

const teamMembers = [
  {
    id: 'team-member-1',
    name: 'Sophia Davis',
    role: 'Lead Developer',
  },
  {
    id: 'team-member-2',
    name: 'Liam Martinez',
    role: 'Frontend Developer',
  },
  {
    id: 'team-member-3',
    name: 'Ava Wilson',
    role: 'Backend Developer',
  },
  {
    id: 'team-member-4',
    name: 'Noah Brown',
    role: 'UI/UX Designer',
  },
  {
    id: 'team-member-5',
    name: 'Emma Johnson',
    role: 'QA Engineer',
  },
  {
    id: 'team-member-6',
    name: 'Oliver Garcia',
    role: 'DevOps Engineer',
  },
  {
    id: 'team-member-7',
    name: 'Charlotte Rodriguez',
    role: 'Project Manager',
  },
  {
    id: 'team-member-8',
    name: 'James Smith',
    role: 'Data Scientist',
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
              <CardDescription>Members of the engineering department.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
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
            <ScrollArea className="h-[460px] p-4">
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
                        className="shadow-md transition-shadow hover:shadow-lg"
                    >
                        <CardContent
                        className={cn(
                            'p-4',
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
                            <Button size="sm" className="bg-gradient-to-r from-primary to-green-700 text-primary-foreground hover:from-primary/90 hover:to-green-700/90">View Performance</Button>
                            )}
                        </div>
                        {layout === 'list' && (
                            <Button size="sm" className="bg-gradient-to-r from-primary to-green-700 text-primary-foreground hover:from-primary/90 hover:to-green-700/90">View Performance</Button>
                        )}
                        </CardContent>
                    </Card>
                    );
                })}
                </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </main>
    </AppLayout>
  );
}
