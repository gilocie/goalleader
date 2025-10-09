
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckSquare, Link as LinkIcon } from 'lucide-react';
import type { SuggestionItem } from '@/context/ai-suggestion-context';
import Link from 'next/link';

interface SuggestionDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  suggestion: SuggestionItem;
  onMarkAsRead: (id: string) => void;
}

export function SuggestionDetailsDialog({
  isOpen,
  onOpenChange,
  suggestion,
  onMarkAsRead,
}: SuggestionDetailsDialogProps) {
  const isBook = suggestion.type === 'book';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>{suggestion.title}</DialogTitle>
          {suggestion.source && (
            <DialogDescription>
                Source: {suggestion.source}
            </DialogDescription>
          )}
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto py-4 min-h-0">
          <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
            {suggestion.content}
          </p>
        </div>
        
        <DialogFooter className="flex-shrink-0 pt-4 border-t">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {isBook && suggestion.link ? (
            <Button asChild>
              <Link href={suggestion.link} target="_blank">
                <LinkIcon className="mr-2 h-4 w-4" />
                Find Book
              </Link>
            </Button>
          ) : !suggestion.read && (
            <Button 
              onClick={() => {
                onMarkAsRead(suggestion.id);
                onOpenChange(false);
              }}
              className="bg-gradient-to-r from-primary to-primary-dark text-primary-foreground hover:from-primary/90 hover:to-primary-dark/90"
            >
              <CheckSquare className="mr-2 h-4 w-4" /> 
              Mark as Read
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
