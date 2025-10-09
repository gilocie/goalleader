
'use client';

import { Check, CheckCheck, Clock } from 'lucide-react';
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
      return 'text-blue-400';
    }
    return 'text-primary-foreground/80';
  }

  const iconClass = cn('h-4 w-4', getReadColor(), className);

  switch (status) {
    case 'request_sent':
        return <Clock className={cn('h-4 w-4 text-primary-foreground/80', className)} />;
    case 'sent':
      return <Check className={iconClass} />;
    case 'delivered':
      return <CheckCheck className={iconClass} />;
    case 'read':
      // The read color is blue, so we use a different class here.
      return <CheckCheck className={cn('h-4 w-4 text-blue-400', className)} />;
    default:
      return null;
  }
}
