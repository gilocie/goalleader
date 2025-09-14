
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import ReactMarkdown from 'react-markdown';
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
import { Textarea } from '@/components/ui/textarea';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Sparkles, Wand2 } from 'lucide-react';
import { generateMarketingContent, GenerateMarketingContentOutput } from '@/ai/flows/generate-marketing-content-flow';

const formSchema = z.object({
  topic: z.string().min(3, 'Topic must be at least 3 characters long.'),
});

type FormValues = z.infer<typeof formSchema>;
type Suggestion = GenerateMarketingContentOutput['suggestions'][0];

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

  const handleApprove = () => {
    // In a real app, you'd save the selected content here.
    console.log('Approved content:', generatedContent);
    handleOpenChange(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-4xl h-auto max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Generate Marketing Content</DialogTitle>
          <DialogDescription>
            Enter a topic or product, and GoalLeader AI will create a set of marketing materials for you.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden">
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
                        <Textarea
                          placeholder="e.g., 'An innovative insurance policy that gives customers 15% more on every claim.'"
                          className="h-24"
                          {...field}
                        />
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
                  {generatedContent ? 'Regenerate' : 'Generate Content'}
                </Button>
              </form>
            </Form>
          </div>

          {/* Right side: Results */}
          <div className="flex flex-col overflow-hidden">
            {isLoading && (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}

            {!isLoading && !generatedContent && (
              <div className="flex flex-col items-center justify-center text-center p-8 space-y-4 rounded-lg bg-muted/50 h-full">
                <Sparkles className="h-12 w-12 text-primary" />
                <h3 className="font-semibold">Your content will appear here</h3>
                <p className="text-sm text-muted-foreground">Enter a topic to get started.</p>
              </div>
            )}

            {generatedContent && (
              <Tabs defaultValue="suggestion-0" className="flex flex-col h-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="suggestion-0">Suggestion 1</TabsTrigger>
                  <TabsTrigger value="suggestion-1">Suggestion 2</TabsTrigger>
                  <TabsTrigger value="suggestion-2">Suggestion 3</TabsTrigger>
                </TabsList>
                {generatedContent.suggestions.map((suggestion, index) => (
                  <TabsContent key={index} value={`suggestion-${index}`} className="flex-1 overflow-hidden mt-4">
                    <ScrollArea className="h-full pr-4">
                      <div className="space-y-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Blog Post</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <p className="font-semibold">{suggestion.blogTitle}</p>
                            <div className="prose prose-sm text-muted-foreground max-w-none prose-headings:font-semibold prose-headings:text-card-foreground">
                                <ReactMarkdown>{suggestion.blogOutline}</ReactMarkdown>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Social Media Post</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground">{suggestion.socialMediaPost}</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Email Subject Line</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground">{suggestion.emailSubject}</p>
                          </CardContent>
                        </Card>
                      </div>
                    </ScrollArea>
                  </TabsContent>
                ))}
              </Tabs>
            )}
          </div>
        </div>
        <DialogFooter className="pt-4">
            <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleApprove} disabled={!generatedContent}>Approve</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
