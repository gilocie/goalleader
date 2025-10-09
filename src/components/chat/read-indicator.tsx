
'use client';

import { Check, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Message } from '@/types/chat';

interface ReadIndicatorProps {
  status?: Message['readStatus'];
  className?: string;
  isSelf?: boolean;
}

export function ReadIndicator({ status, className, isSelf = false }: ReadIndicatorProps) {
  if (!status || !isSelf) return null;

  const getReadColor = () => {
    if (status === 'read') {
      return 'text-blue-500';
    }
    return 'text-muted-foreground';
  }

  switch (status) {
    case 'sent':
      return <Check className={cn('h-4 w-4 text-muted-foreground', className)} />;
    case 'delivered':
      return <CheckCheck className={cn('h-4 w-4 text-muted-foreground', className)} />;
    case 'read':
      return <CheckCheck className={cn('h-4 w-4', getReadColor(), className)} />;
    default:
      return null;
  }
}
