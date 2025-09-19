
'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, User, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useTimeTracker } from '@/context/time-tracker-context';
import { Logo } from '../icons';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function DashboardChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const userAvatar = PlaceHolderImages.find((img) => img.id === 'user-avatar');

  const { tasks } = useTimeTracker();
  const completedTasks = tasks.filter((t) => t.status === 'Completed');
  const performancePercentage = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  const scrollToBottom = () => {
    setTimeout(() => {
        if (scrollAreaRef.current) {
            const viewport = scrollAreaRef.current.querySelector('div');
            if (viewport) {
                viewport.scrollTop = viewport.scrollHeight;
            }
        }
    }, 0);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const chatInput = {
        message: input,
        tasks: tasks.map(t => ({ name: t.name, status: t.status })),
        performance: {
          completedTasks: completedTasks.length,
          totalTasks: tasks.length,
          performancePercentage,
        },
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chatInput),
      });
      const data = await response.json();
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.output || 'Sorry, I had trouble thinking of a response.',
      };
      setMessages((prev) => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Chat API error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I couldn\'t connect to the AI. Please try again.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Logo className="h-6 w-6 text-primary" />
          GoalLeader AI
        </CardTitle>
        <CardDescription>
          Your personal productivity assistant. Ask me anything!
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden p-0">
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center p-8 h-full text-muted-foreground">
                    <Logo className="h-10 w-10 mb-2 text-primary"/>
                    <p>Start a conversation to get insights.</p>
                </div>
            ) : (
                 messages.map((message, index) => (
                    <div
                        key={index}
                        className={cn(
                        'flex items-start gap-3',
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                        )}
                    >
                        {message.role === 'assistant' && (
                        <Avatar className="h-8 w-8 border-2 border-primary/50">
                             <div className="h-full w-full flex items-center justify-center bg-background">
                                <Logo className="h-5 w-5 text-primary" />
                            </div>
                        </Avatar>
                        )}
                        <div
                        className={cn(
                            'max-w-[80%] rounded-lg p-3 text-sm shadow-md',
                            message.role === 'user'
                            ? 'bg-primary text-primary-foreground rounded-br-none'
                            : 'bg-muted rounded-bl-none'
                        )}
                        >
                        {message.content}
                        </div>
                        {message.role === 'user' && (
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={userAvatar?.imageUrl} data-ai-hint={userAvatar?.imageHint} />
                            <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                        )}
                    </div>
                ))
            )}
             {isLoading && (
              <div className="flex items-start gap-3 justify-start">
                <Avatar className="h-8 w-8 border-2 border-primary/50">
                    <div className="h-full w-full flex items-center justify-center bg-background">
                        <Logo className="h-5 w-5 text-primary" />
                    </div>
                </Avatar>
                <div className="bg-muted rounded-lg p-3 text-sm shadow-md flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span>Thinking...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="p-4 border-t">
          <form onSubmit={handleSubmit} className="relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask for advice, summarize tasks, etc..."
              className="pr-12"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
              disabled={isLoading || !input.trim()}
            >
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
