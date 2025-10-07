
'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, MoreHorizontal, Trash2 } from "lucide-react";
import type { Suggestion } from "@/types/marketing";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { format } from 'date-fns';

interface ApprovedContentActionsProps {
  content: Suggestion[];
  onContentDeleted: (updatedContent: Suggestion[]) => void;
}

export function ApprovedContentActions({ content, onContentDeleted }: ApprovedContentActionsProps) {

  const handleDelete = (titleToDelete: string) => {
    const updatedContent = content.filter(c => c.blogTitle !== titleToDelete);
    onContentDeleted(updatedContent);
  };
  
  // We can add a date property to the suggestion when it's approved.
  // For now, we'll just use the current date for demonstration.
  const approvedDate = new Date();

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
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
    </>
  );
}
