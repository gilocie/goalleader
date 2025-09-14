
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface MemberHeaderProps {
    name: string;
    role: string;
    avatarUrl?: string;
    avatarHint?: string;
}

export function MemberHeader({ name, role, avatarUrl, avatarHint }: MemberHeaderProps) {
  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-20 w-20">
        <AvatarImage src={avatarUrl} alt={name} data-ai-hint={avatarHint} />
        <AvatarFallback>{name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
      </Avatar>
      <div>
        <h1 className="text-3xl font-bold">{name}</h1>
        <p className="text-muted-foreground">{role}</p>
      </div>
    </div>
  );
}
