
'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, MoreHorizontal, Trash2, Send, Clock, Users, X } from "lucide-react";
import type { Suggestion } from "@/types/marketing";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { format, formatDistanceToNowStrict } from 'date-fns';
import { SendContentDialog } from './send-content-dialog';
import { ViewContentDialog } from './view-content-dialog';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface ApprovedContentActionsProps {
  content: Suggestion[];
  onContentDeleted: (updatedContent: Suggestion[]) => void;
  onContentUpdated: (updatedContent: Suggestion) => void;
}

const Countdown = ({ date }: { date: string }) => {
    const [countdown, setCountdown] = useState('');

    useEffect(() => {
        const updateCountdown = () => {
            const distance = formatDistanceToNowStrict(new Date(date), { addSuffix: true });
            setCountdown(distance);
        };
        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);
        return () => clearInterval(interval);
    }, [date]);

    return (
        <div className="flex items-center gap-2 text-sm text-primary-foreground/80 font-semibold bg-primary/80 rounded-full px-3 py-1 text-center">
            <Clock className="h-4 w-4" />
            <span>Sends {countdown}</span>
        </div>
    );
};

export function ApprovedContentActions({ content, onContentDeleted, onContentUpdated }: ApprovedContentActionsProps) {
  const [isSendDialogOpen, setSendDialogOpen] = useState(false);
  const [isViewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<Suggestion | null>(null);
  const [viewingContent, setViewingContent] = useState<Suggestion | null>(null);

  const handleDelete = (titleToDelete: string) => {
    const updatedContent = content.filter(c => c.blogTitle !== titleToDelete);
    onContentDeleted(updatedContent);
  };
  
  const handleSendClick = (item: Suggestion) => {
    setSelectedContent(item);
    setSendDialogOpen(true);
  };
  
  const handleViewClick = (item: Suggestion) => {
    setViewingContent(item);
    setViewDialogOpen(true);
  };
  
  const handleScheduleUpdate = (item: Suggestion) => {
    onContentUpdated(item);
    setSendDialogOpen(false);
  }

  const handleCancelSchedule = (item: Suggestion) => {
    onContentUpdated({
        ...item,
        scheduledAt: undefined,
        recipients: undefined,
    });
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {content.length > 0 ? (
                content.map((item, index) => (
                    <Card key={index} className={cn(
                        "flex flex-col p-4 shadow-md hover:shadow-lg transition-shadow relative border-2",
                        item.scheduledAt ? 'border-amber-500' : 'border-primary'
                    )}>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="default" size="icon" className={cn("absolute top-2 right-2 h-8 w-8 text-primary-foreground", item.scheduledAt ? "bg-amber-500 hover:bg-amber-500/90" : "bg-primary hover:bg-primary/90")}>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => handleDelete(item.blogTitle)}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <CardHeader className='p-4'>
                            <CardTitle className={cn("text-lg line-clamp-2", item.scheduledAt ? "text-amber-600" : "text-primary")}>{item.blogTitle}</CardTitle>
                            {item.scheduledAt ? (
                                <div className="space-y-2 pt-2">
                                    <Countdown date={item.scheduledAt} />
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Users className="h-4 w-4" />
                                        <span>{item.recipients?.length} recipients</span>
                                    </div>
                                </div>
                            ) : (
                                <CardDescription>
                                    Approved on: {format(new Date(), 'PPP')}
                                </CardDescription>
                            )}
                        </CardHeader>
                        <CardContent className="flex-grow p-4" />
                        <CardFooter className="flex justify-between p-4 pt-0">
                            <div className="flex gap-2">
                                <Button variant="outline" className="hover:bg-primary hover:text-primary-foreground" onClick={() => handleViewClick(item)}>
                                    <Eye className="mr-2 h-4 w-4" /> View
                                </Button>
                                {item.scheduledAt ? (
                                     <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                             <Button variant="destructive">
                                                <X className="mr-2 h-4 w-4" /> Cancel
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will cancel the scheduled campaign. This action cannot be undone.
                                            </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                            <AlertDialogCancel>Close</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleCancelSchedule(item)}>Confirm</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                ) : (
                                    <Button onClick={() => handleSendClick(item)} className="bg-primary text-primary-foreground hover:bg-primary/90">
                                        <Send className="mr-2 h-4 w-4" /> Send
                                    </Button>
                                )}
                            </div>
                        </CardFooter>
                    </Card>
                ))
            ) : (
                <div className="col-span-full text-center text-muted-foreground p-8">
                    No approved content yet. Use GoalLeader to generate some!
                </div>
            )}
       </div>
       <SendContentDialog 
        isOpen={isSendDialogOpen}
        onOpenChange={setSendDialogOpen}
        selectedContent={selectedContent}
        onSchedule={handleScheduleUpdate}
       />
       <ViewContentDialog
        isOpen={isViewDialogOpen}
        onOpenChange={setViewDialogOpen}
        content={viewingContent}
      />
    </>
  );
}
