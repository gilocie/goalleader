
'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send, Eye, MoreHorizontal, Trash2 } from "lucide-react";
import type { Suggestion } from "@/types/marketing";
import { SendContentDialog } from './send-content-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { format } from 'date-fns';

interface ApprovedContentActionsProps {
  content: Suggestion[];
}

export function ApprovedContentActions({ content: initialContent }: ApprovedContentActionsProps) {
  const [content, setContent] = useState(initialContent);

  const handleDelete = (titleToDelete: string) => {
    setContent(prev => prev.filter(c => c.blogTitle !== titleToDelete));
  };
  
  // We can add a date property to the suggestion when it's approved.
  // For now, we'll just use the current date for demonstration.
  const approvedDate = new Date();

  return (
    <>
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Approved Marketing Content</CardTitle>
            <CardDescription>
              View and manage your approved content.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {content.length > 0 ? (
                    content.map((item, index) => (
                        <Card key={index} className="flex flex-col">
                            <CardHeader>
                                <CardTitle className="text-lg line-clamp-2">{item.blogTitle}</CardTitle>
                                <CardDescription>
                                    Approved on: {format(approvedDate, 'PPP')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow" />
                            <CardFooter className="flex justify-between">
                                <Button variant="outline">
                                    <Eye className="mr-2 h-4 w-4" /> View
                                </Button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
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
                            </CardFooter>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full text-center text-muted-foreground p-8">
                        No approved content yet. Use GoalLeader to generate some!
                    </div>
                )}
           </div>
        </CardContent>
      </Card>
    </>
  );
}
