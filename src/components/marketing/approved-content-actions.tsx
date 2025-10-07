
'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Send, Eye } from "lucide-react";
import type { Suggestion } from "@/types/marketing";
import { Checkbox } from "../ui/checkbox";
import { SendContentDialog } from './send-content-dialog';

interface ApprovedContentActionsProps {
  content: Suggestion[];
}

export function ApprovedContentActions({ content }: ApprovedContentActionsProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [isSendDialogOpen, setSendDialogOpen] = useState(false);

  const handleSelect = (title: string, isSelected: boolean) => {
    setSelected(prev => isSelected ? [...prev, title] : prev.filter(t => t !== title));
  }

  const handleSelectAll = (isSelected: boolean) => {
    setSelected(isSelected ? content.map(c => c.blogTitle) : []);
  }

  const selectedContent = content.filter(c => selected.includes(c.blogTitle));

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Approved Marketing Content</CardTitle>
            <CardDescription>
              Select content to send to your clients.
            </CardDescription>
          </div>
          <Button disabled={selected.length === 0} onClick={() => setSendDialogOpen(true)}>
            <Send className="mr-2 h-4 w-4" />
            Send Selected ({selected.length})
          </Button>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox 
                      checked={selected.length > 0 && selected.length === content.length}
                      onCheckedChange={(checked) => handleSelectAll(!!checked)}
                    />
                  </TableHead>
                  <TableHead className="w-[40%]">Blog Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {content.length > 0 ? (
                  content.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Checkbox 
                          checked={selected.includes(item.blogTitle)}
                          onCheckedChange={(checked) => handleSelect(item.blogTitle, !!checked)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{item.blogTitle}</TableCell>
                      <TableCell>
                        <Badge variant="outline">Blog Post</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No approved content yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
      <SendContentDialog 
        isOpen={isSendDialogOpen}
        onOpenChange={setSendDialogOpen}
        selectedContent={selectedContent}
      />
    </>
  );
}
