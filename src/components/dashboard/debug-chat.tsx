
'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, User, Loader2, Paperclip, Mic } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useTimeTracker } from '@/context/time-tracker-context';
import { Logo } from '../icons';
import { getInitialMessage } from '@/ai/flows/initial-message-flow';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function DashboardChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFirstMessageLoading, setIsFirstMessageLoading] = useState(true);
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
    const fetchInitialMessage = async () => {
        try {
            const initialMessageContent = await getInitialMessage({ name: 'Patrick' });
            setMessages([{ role: 'assistant', content: initialMessageContent }]);
        } catch (error) {
            console.error("Failed to fetch initial message:", error);
            setMessages([{ role: 'assistant', content: "Hi Patrick! I had a little trouble starting up, but I'm ready to help now." }]);
        } finally {
            setIsFirstMessageLoading(false);
        }
    };
    fetchInitialMessage();
  }, []);

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
        lastInteractionMinutesAgo: 0,
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
        <CardTitle>
          Goal Leader
        </CardTitle>
        <CardDescription>
          Your personal productivity assistant. Ask me anything!
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden p-0">
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {isFirstMessageLoading ? (
                <div className="flex items-start gap-3 justify-start">
                    <Avatar className="h-8 w-8 border-2 border-primary/50">
                        <div className="h-full w-full flex items-center justify-center bg-background">
                            <Logo className="h-5 w-5 text-primary" />
                        </div>
                    </Avatar>
                    <div className="bg-muted rounded-lg p-3 text-sm shadow-md flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span>Typing...</span>
                    </div>
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
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        )}
                        >
                        <div className="prose prose-sm max-w-none prose-p:my-0 prose-headings:my-2 prose-blockquote:my-2">
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
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
             {isLoading && !isFirstMessageLoading && (
              <div className="flex items-start gap-3 justify-start">
                <Avatar className="h-8 w-8 border-2 border-primary/50">
                    <div className="h-full w-full flex items-center justify-center bg-background">
                        <Logo className="h-5 w-5 text-primary" />
                    </div>
                </Avatar>
                <div className="bg-muted rounded-lg p-3 text-sm shadow-md flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span>Typing...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="p-4 border-t">
          <form onSubmit={handleSubmit} className="relative">
             <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <Button variant="ghost" size="icon" type="button">
                    <Paperclip className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" type="button">
                    <Mic className="h-4 w-4" />
                </Button>
            </div>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask for advice, summarize tasks, etc..."
              className="pr-12 pl-20"
              disabled={isLoading || isFirstMessageLoading}
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
