
'use client';

import { useState, FormEvent, useRef, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Send } from 'lucide-react';
import { chat } from '@/ai/flows/chat-flow';
import { Textarea } from '../ui/textarea';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface Message {
  role: 'user' | 'model';
  content: string;
}

export function GoalReaderAIChat({ className }: { className?: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const userAvatar = PlaceHolderImages.find((img) => img.id === 'user-avatar');

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError('');

    try {
      const response = await chat(input);
      const modelMessage: Message = { role: 'model', content: response };
      setMessages(prev => [...prev, modelMessage]);
    } catch (err) {
      console.error('Error in chat flow:', err);
      setError('An error occurred. Please try again.');
      setMessages(prev => prev.slice(0, -1)); // Remove the user's message on error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={cn("h-full flex flex-col min-h-[480px]", className)}>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          GoalLeader AI Chat
        </CardTitle>
        <CardDescription className="text-xs">
          Your personal assistant for productivity.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
        <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground pt-8">
                Ask me anything to get started!
              </div>
            )}
            {messages.map((message, index) => (
              <div key={index} className={cn("flex items-start gap-3", message.role === 'user' && 'justify-end')}>
                {message.role === 'model' && (
                  <Avatar className="h-8 w-8 border-2 border-primary">
                    <div className="bg-primary-foreground h-full w-full flex items-center justify-center font-bold text-primary">
                      AI
                    </div>
                  </Avatar>
                )}
                <div className={cn("max-w-[75%] rounded-lg p-3 text-sm", 
                    message.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted rounded-bl-none'
                )}>
                  {message.content}
                </div>
                 {message.role === 'user' && (
                   <Avatar className="h-8 w-8">
                      <AvatarImage src={userAvatar?.imageUrl} alt="You" data-ai-hint={userAvatar?.imageHint} />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3">
                 <Avatar className="h-8 w-8 border-2 border-primary">
                    <div className="bg-primary-foreground h-full w-full flex items-center justify-center font-bold text-primary">
                      AI
                    </div>
                  </Avatar>
                <div className="bg-muted rounded-lg p-3 flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <form onSubmit={handleSubmit} className="relative mt-4">
            <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your tasks, performance, or get suggestions..."
                className="pr-20"
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                    }
                }}
            />
            <Button 
                type="submit" 
                disabled={isLoading || !input.trim()} 
                size="icon"
                className="absolute right-2 bottom-2 h-8 w-16"
            >
                <Send className="h-4 w-4" />
            </Button>
        </form>
         {error && <p className="text-destructive text-xs mt-2">{error}</p>}
      </CardContent>
    </Card>
  );
}
