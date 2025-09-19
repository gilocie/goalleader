
'use client';

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
import { Suggestion } from "./generate-content-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

interface ApprovedContentTableProps {
  content: Suggestion[];
}

export function ApprovedContentTable({ content }: ApprovedContentTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Approved Marketing Content</CardTitle>
        <CardDescription>
          A list of your approved, AI-generated marketing materials.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Blog Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {content.length > 0 ? (
                content.map((item, index) => (
                  <TableRow key={index}>
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
                  <TableCell colSpan={3} className="h-24 text-center">
                    No approved content yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
