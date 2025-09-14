
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
import { Notice } from '@/app/notices/page';

interface NoticeDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  notice: Notice;
  onMarkAsRead: (id: number) => void;
}

export function NoticeDetailsDialog({
  isOpen,
  onOpenChange,
  notice,
  onMarkAsRead,
}: NoticeDetailsDialogProps) {
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{notice.title}</DialogTitle>
          <DialogDescription>
            Posted by {notice.author} on {new Date(notice.date).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
            <p className="text-sm text-foreground whitespace-pre-wrap">{notice.content}</p>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {!notice.read && (
            <Button onClick={() => onMarkAsRead(notice.id)}>
              <CheckSquare className="mr-2 h-4 w-4" /> Mark as Read
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

