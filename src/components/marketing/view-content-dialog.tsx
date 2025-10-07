
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ReactMarkdown from 'react-markdown';
import type { Suggestion } from '@/types/marketing';

interface ViewContentDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  content: Suggestion | null;
}

export function ViewContentDialog({ isOpen, onOpenChange, content }: ViewContentDialogProps) {
  if (!content) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl flex flex-col h-[600px] max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="line-clamp-2">{content.blogTitle}</DialogTitle>
          <DialogDescription>
            Review the generated content below.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 px-6 pb-4 min-h-0">
            <Tabs defaultValue="blog" className="flex flex-col h-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="blog">Blog Outline</TabsTrigger>
                    <TabsTrigger value="social">Social Post</TabsTrigger>
                    <TabsTrigger value="email">Email</TabsTrigger>
                </TabsList>
                <div className="flex-1 mt-4 overflow-hidden">
                    <ScrollArea className="h-full pr-4">
                        <TabsContent value="blog" className="mt-0">
                            <Card>
                                <CardContent className="p-4">
                                    <div className="prose prose-sm text-muted-foreground max-w-none prose-headings:font-semibold prose-headings:text-card-foreground">
                                        <ReactMarkdown>{content.blogOutline.replace(/\\n/g, '\n')}</ReactMarkdown>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="social">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Social Media Post</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{content.socialMediaPost}</p>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="email">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Email Subject</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">{content.emailSubject}</p>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </ScrollArea>
                </div>
            </Tabs>
        </div>

        <DialogFooter className="p-6 pt-4 border-t flex-shrink-0">
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
