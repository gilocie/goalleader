
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
import type { Suggestion } from '@/types/marketing';
import { cn } from '@/lib/utils';


const formSchema = z.object({
  topic: z.string().min(3, 'Topic must be at least 3 characters long.'),
});

type FormValues = z.infer<typeof formSchema>;

interface GenerateContentDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onApprove: (content: Suggestion) => void;
}

export function GenerateContentDialog({ isOpen, onOpenChange, onApprove }: GenerateContentDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GenerateMarketingContentOutput | null>(null);
  const [activeTab, setActiveTab] = useState("suggestion-0");

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
      setActiveTab("suggestion-0");
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
    if (!generatedContent) return;
    const selectedSuggestionIndex = parseInt(activeTab.split('-')[1]);
    const selectedSuggestion = generatedContent.suggestions[selectedSuggestionIndex];
    if (selectedSuggestion) {
      onApprove(selectedSuggestion);
    }
    handleOpenChange(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-4xl h-auto max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle>Generate Marketing Content</DialogTitle>
          <DialogDescription>
            Enter a topic or product, and GoalLeader will create a set of marketing materials for you.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden px-6">
          {/* Form Side (always visible) or Top on mobile */}
          <div className={cn(
            "flex flex-col gap-4 md:order-1",
            generatedContent && "hidden md:flex" 
          )}>
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
                 {!generatedContent && (
                   <Button type="submit" disabled={isLoading} className="w-full md:hidden">
                      {isLoading ? ( <Loader2 className="mr-2 h-4 w-4 animate-spin" />) : ( <Wand2 className="mr-2 h-4 w-4" />)}
                      Generate Content
                    </Button>
                 )}
              </form>
            </Form>
          </div>

          {/* Results side (Right on desktop, Full-width on mobile when content is generated) */}
          <div className={cn(
            "flex-col overflow-hidden md:order-2",
            generatedContent ? "flex" : "hidden md:flex"
            )}>
            {isLoading && (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}

            {!isLoading && !generatedContent && (
              <div className="hidden md:flex flex-col items-center justify-center text-center p-8 space-y-4 rounded-lg bg-muted/50 h-full">
                <Sparkles className="h-12 w-12 text-primary" />
                <h3 className="font-semibold">Your content will appear here</h3>
                <p className="text-sm text-muted-foreground">Enter a topic to get started.</p>
              </div>
            )}

            {generatedContent && (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full -mx-4 sm:mx-0">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="suggestion-0">Suggestion 1</TabsTrigger>
                  <TabsTrigger value="suggestion-1">Suggestion 2</TabsTrigger>
                  <TabsTrigger value="suggestion-2">Suggestion 3</TabsTrigger>
                </TabsList>
                <div className="flex-1 overflow-hidden mt-4">
                    <ScrollArea className="h-full pr-4">
                        {generatedContent.suggestions.map((suggestion, index) => (
                        <TabsContent key={index} value={`suggestion-${index}`} className="mt-0 space-y-4">
                            <Card>
                                <CardHeader>
                                <CardTitle className="text-lg">Blog Post</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                <p className="font-semibold">{suggestion.blogTitle}</p>
                                <div className="prose prose-sm text-muted-foreground max-w-none prose-headings:font-semibold prose-headings:text-card-foreground prose-h1:text-xl prose-h2:text-lg prose-h3:text-base prose-h1:mb-2 prose-h2:mb-2 prose-h3:mb-2 prose-h1:mt-4 prose-h2:mt-4 prose-h3:mt-4">
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
                        </TabsContent>
                        ))}
                    </ScrollArea>
                </div>
              </Tabs>
            )}
          </div>
        </div>

        <DialogFooter className="p-6 pt-4 border-t">
            <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
            </DialogClose>
             {!generatedContent ? (
                <Button type="submit" disabled={isLoading} onClick={form.handleSubmit(onSubmit)} className="hidden md:inline-flex">
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Wand2 className="mr-2 h-4 w-4" />
                  )}
                  Generate Content
                </Button>
             ) : (
                <Button onClick={handleApprove}>Approve</Button>
             )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
