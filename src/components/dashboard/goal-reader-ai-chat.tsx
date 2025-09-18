'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import ReactMarkdown from 'react-markdown';
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Sparkles, Wand2 } from 'lucide-react';
import { generateMarketingContent, GenerateMarketingContentOutput } from '@/ai/flows/generate-marketing-content-flow';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  topic: z.string().min(3, 'Topic must be at least 3 characters long.'),
});

type FormValues = z.infer<typeof formSchema>;

export function GoalReaderAIChat({ className }: { className?: string }) {
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

  return (
    <Card className={cn("h-full flex flex-col min-h-[480px]", className)}>
      <CardHeader>
        <CardTitle>GoalLeader Chat</CardTitle>
        <CardDescription>
            Your AI assistant for productivity and project management.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
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
                            <Textarea
                            placeholder="e.g., 'A new AI-powered project management tool'"
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
                    Generate Content
                    </Button>
                </form>
                </Form>
            </div>

            {/* Right side: Results */}
            <div className="flex flex-col overflow-hidden border rounded-lg">
                <ScrollArea className="h-full">
                    <div className="p-4">
                    {isLoading && (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    )}

                    {!isLoading && !generatedContent && (
                        <div className="flex flex-col items-center justify-center text-center p-8 space-y-4 rounded-lg bg-muted/50 h-full">
                            <Sparkles className="h-12 w-12 text-primary" />
                            <h3 className="font-semibold">AI results will appear here</h3>
                        </div>
                    )}
                    
                    {generatedContent && (
                        <div className="prose prose-sm max-w-none">
                            <h4>Blog Title Suggestion:</h4>
                            <p>{generatedContent.suggestions[0].blogTitle}</p>
                            <h4>Social Media Post:</h4>
                            <p>{generatedContent.suggestions[0].socialMediaPost}</p>
                            <h4>Email Subject:</h4>
                            <p>{generatedContent.suggestions[0].emailSubject}</p>
                        </div>
                    )}
                    </div>
                </ScrollArea>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
