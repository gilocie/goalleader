
'use client';

import { useState, FormEvent } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Wand2 } from 'lucide-react';
import { generateMarketingContent, GenerateMarketingContentOutput } from '@/ai/flows/generate-marketing-content-flow';
import { Textarea } from '../ui/textarea';
import { cn } from '@/lib/utils';

export function GoalReaderAIChat({ className }: { className?: string }) {
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsLoading(true);
    setResult('');
    setError('');

    try {
      const response = await generateMarketingContent({ topic });
      if (response.suggestions && response.suggestions.length > 0) {
        setResult(response.suggestions[0].blogTitle);
      } else {
        setError("The AI didn't return any suggestions.");
      }
    } catch (err) {
      console.error('Error generating content:', err);
      setError('An error occurred while generating content. Please check the console.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={cn("h-full flex flex-col min-h-[480px]", className)}>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          AI Content Generation Test
        </CardTitle>
        <CardDescription className="text-xs">
          Using the marketing flow to test AI functionality on the dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="topic-input" className="font-medium text-sm">Topic</label>
                <Textarea
                    id="topic-input"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Enter a topic to generate content..."
                    className="mt-2"
                />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                <Wand2 className="mr-2 h-4 w-4" />
                )}
                Generate Content
            </Button>
        </form>
        
        <div className="flex-1 mt-4">
            <h3 className="font-semibold">Result:</h3>
            {isLoading && (
                 <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                 </div>
            )}
            {error && <p className="text-destructive mt-2">{error}</p>}
            {result && <p className="text-muted-foreground mt-2 p-4 bg-muted rounded-md">{result}</p>}
        </div>

      </CardContent>
    </Card>
  );
}
