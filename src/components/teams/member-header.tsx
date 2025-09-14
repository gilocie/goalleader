
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { MessageSquare, Phone, CalendarPlus } from 'lucide-react';

interface MemberHeaderProps {
    name: string;
    role: string;
    status: 'online' | 'offline';
    avatarUrl?: string;
    avatarHint?: string;
}

export function MemberHeader({ name, role, status, avatarUrl, avatarHint }: MemberHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="relative">
            <Avatar className="h-20 w-20">
                <AvatarImage src={avatarUrl} alt={name} data-ai-hint={avatarHint} />
                <AvatarFallback>{name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className={cn(
                'absolute bottom-1 right-1 h-4 w-4 rounded-full border-4 border-background',
                status === 'online' ? 'bg-green-500' : 'bg-gray-400'
            )} />
        </div>
        <div>
            <h1 className="text-3xl font-bold">{name}</h1>
            <p className="text-muted-foreground">{role}</p>
        </div>
      </div>
      <TooltipProvider>
        <div className="flex items-center gap-2">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="outline" size="icon">
                        <MessageSquare className="h-5 w-5 text-primary" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>Send Message</TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="outline" size="icon">
                        <Phone className="h-5 w-5 text-primary" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>Call</TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="outline" size="icon">
                        <CalendarPlus className="h-5 w-5 text-primary" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>Invite to Meeting</TooltipContent>
            </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
}
