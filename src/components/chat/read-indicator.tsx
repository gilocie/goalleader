
'use client';

import { Check, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Message } from '@/types/chat';

interface ReadIndicatorProps {
  status?: Message['readStatus'];
  className?: string;
}

export function ReadIndicator({ status, className }: ReadIndicatorProps) {
  if (!status) return null;

  switch (status) {
    case 'sent':
      return <Check className={cn('h-4 w-4 text-muted-foreground', className)} />;
    case 'delivered':
      return <CheckCheck className={cn('h-4 w-4 text-muted-foreground', className)} />;
    case 'read':
      return <CheckCheck className={cn('h-4 w-4 text-blue-500', className)} />;
    default:
      return null;
  }
}
