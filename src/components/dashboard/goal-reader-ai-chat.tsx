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
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Sparkles, Send } from 'lucide-react';
import { generateMarketingContent, GenerateMarketingContentOutput } from '@/ai/flows/generate-marketing-content-flow';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  topic: z.string().min(1, 'Message cannot be empty.'),
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
      form.reset();
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
        {/* Top area: Results */}
        <div className="flex-1 flex flex-col overflow-hidden border rounded-lg">
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

        {/* Bottom area: Form */}
        <div className="flex flex-col gap-4">
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="relative">
                <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                    <FormItem>
                    <FormControl>
                        <Textarea
                        placeholder="Type your message here..."
                        className="pr-14"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                form.handleSubmit(onSubmit)();
                            }
                        }}
                        {...field}
                        />
                    </FormControl>
                    <FormMessage className="absolute -bottom-5 left-2 text-xs" />
                    </FormItem>
                )}
                />
                <Button type="submit" disabled={isLoading} size="icon" className="absolute right-2.5 top-1/2 -translate-y-1/2 h-8 w-8">
                {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Send className="h-4 w-4" />
                )}
                </Button>
            </form>
            </Form>
        </div>
      </CardContent>
    </Card>
  );
}
