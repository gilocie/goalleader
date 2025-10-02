
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
import { CheckSquare } from 'lucide-react';

// Define Notice type locally if not exported from page
export interface Notice {
  id: string;
  title: string;
  message: string;
  author: string;
  timestamp: string;
  read: boolean;
}

interface NoticeDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  notice: Notice;
  onMarkAsRead: (id: string) => void;
}

export function NoticeDetailsDialog({
  isOpen,
  onOpenChange,
  notice,
  onMarkAsRead,
}: NoticeDetailsDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>{notice.title}</DialogTitle>
          <DialogDescription>
            Posted by {notice.author} on {new Date(notice.timestamp).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto py-4 min-h-0">
          <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
            {notice.message}
          </p>
        </div>
        
        <DialogFooter className="flex-shrink-0 pt-4 border-t">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {!notice.read && (
            <Button 
              onClick={() => {
                onMarkAsRead(notice.id);
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
