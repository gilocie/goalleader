
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Loader2, Sparkles, Wand2 } from 'lucide-react';
import { generateMarketingContent, GenerateMarketingContentOutput } from '@/ai/flows/generate-marketing-content-flow';

const formSchema = z.object({
  topic: z.string().min(3, 'Topic must be at least 3 characters long.'),
});

type FormValues = z.infer<typeof formSchema>;

interface GenerateContentDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function GenerateContentDialog({ isOpen, onOpenChange }: GenerateContentDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GenerateMarketingContentOutput | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setGeneratedContent(null);
    try {
      const result = await generateMarketingContent({ topic: data.topic });
      setGeneratedContent(result);
    } catch (error) {
      console.error("Failed to generate content:", error);
      // You could show a toast notification here
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
      setGeneratedContent(null);
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-3xl h-auto max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Generate Marketing Content</DialogTitle>
          <DialogDescription>
            Enter a topic or product, and GoalLeader AI will create a set of marketing materials for you.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                {/* Left side: Form */}
                <div className="flex flex-col gap-4">
                    <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                        control={form.control}
                        name="topic"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Topic / Product</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., 'Sustainable Coffee Beans'" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Wand2 className="mr-2 h-4 w-4" />
                        )}
                        Generate Content
                        </Button>
                    </form>
                    </Form>
                </div>

                {/* Right side: Results */}
                <div className="flex flex-col overflow-hidden">
                    <ScrollArea className="flex-1 -mr-4 pr-4">
                    <div className="space-y-4">
                    {isLoading && (
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    )}

                    {!isLoading && !generatedContent && (
                         <div className="flex flex-col items-center justify-center text-center p-8 space-y-4 rounded-lg bg-muted/50 h-full">
                            <Sparkles className="h-12 w-12 text-primary" />
                            <h3 className="font-semibold">Your content will appear here</h3>
                            <p className="text-sm text-muted-foreground">
                               Enter a topic to get started.
                            </p>
                        </div>
                    )}

                    {generatedContent && (
                        <div className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Blog Post</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <p className="font-semibold">{generatedContent.blogTitle}</p>
                                    <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-body bg-muted p-3 rounded-md">{generatedContent.blogOutline}</pre>
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Social Media Post</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">{generatedContent.socialMediaPost}</p>
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Email Subject Line</CardTitle>
                                </CardHeader>
                                <CardContent>
                                     <p className="text-sm text-muted-foreground">{generatedContent.emailSubject}</p>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                    </div>
                    </ScrollArea>
                </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
