'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Sparkles, Send, Bot, User, Paperclip } from 'lucide-react';
import { chat } from '@/ai/flows/chat-flow';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import TextareaAutosize from 'react-textarea-autosize';

const formSchema = z.object({
  topic: z.string().min(1, 'Message cannot be empty.'),
});

type FormValues = z.infer<typeof formSchema>;

interface Message {
    sender: 'user' | 'ai' | 'typing';
    content: string;
}

export function GoalReaderAIChat({ className }: { className?: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const userAvatar = PlaceHolderImages.find(img => img.id === 'user-avatar');
  const scrollAreaRef = useRef<HTMLDivElement>(null);


  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: '',
    },
  });

  useEffect(() => {
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages])

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setMessages(prev => [...prev, { sender: 'user', content: data.topic }]);
    setMessages(prev => [...prev, { sender: 'typing', content: '' }]);
    form.reset();

    try {
      const result = await chat(data.topic);
      
      setMessages(prev => [
          ...prev.filter(m => m.sender !== 'typing'),
          { sender: 'ai', content: result }
      ]);

    } catch (error) {
      console.error("Failed to generate content:", error);
       setMessages(prev => [
          ...prev.filter(m => m.sender !== 'typing'),
          { sender: 'ai', content: "I'm sorry, an error occurred. Please try again." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const TypingIndicator = () => (
    <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-primary to-green-700">
                <Bot className="h-5 w-5 text-white" />
            </div>
        </Avatar>
        <div className="bg-muted p-3 rounded-lg flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse delay-0"></span>
            <span className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse delay-200"></span>
            <span className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse delay-400"></span>
        </div>
    </div>
  )

  return (
    <Card className={cn("h-full flex flex-col min-h-[480px]", className)}>
      <CardHeader>
        <CardTitle>GoalLeader Chat</CardTitle>
        <CardDescription>
            Your AI assistant for productivity and project management.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden border rounded-lg">
            <ScrollArea className="h-full" ref={scrollAreaRef}>
                <div className="p-4 space-y-6">
                {messages.length === 0 && !isLoading && (
                    <div className="flex flex-col items-center justify-center text-center p-8 space-y-4 rounded-lg bg-muted/50 h-full">
                        <Sparkles className="h-12 w-12 text-primary" />
                        <h3 className="font-semibold">Start the conversation</h3>
                        <p className="text-muted-foreground max-w-xs">Ask me anything about your projects, tasks, or performance.</p>
                    </div>
                )}
                
                {messages.map((message, index) => (
                    <div key={index}>
                      {message.sender === 'typing' ? (
                          <TypingIndicator />
                      ) : (
                        <div className={cn("flex items-start gap-3", message.sender === 'user' && 'flex-row-reverse')}>
                          {message.sender === 'ai' && (
                                <Avatar className="h-8 w-8">
                                    <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-primary to-green-700">
                                        <Bot className="h-5 w-5 text-white" />
                                    </div>
                                </Avatar>
                            )}
                            {message.sender === 'user' && (
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={userAvatar?.imageUrl} alt="User" data-ai-hint={userAvatar?.imageHint} />
                                    <AvatarFallback>U</AvatarFallback>
                                </Avatar>
                            )}
                            <div className={cn("p-3 rounded-lg max-w-[80%]", message.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                                <div className="prose prose-sm prose-p:m-0 max-w-none text-current">
                                    <ReactMarkdown>{message.content}</ReactMarkdown>
                                </div>
                            </div>
                          </div>
                       )}
                    </div>
                ))}

                </div>
            </ScrollArea>
        </div>

        <div className="flex flex-col gap-4">
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-2 border rounded-lg p-2">
                <Button variant="ghost" size="icon">
                    <Paperclip />
                    <span className="sr-only">Attach file</span>
                </Button>
                <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                    <FormItem className="flex-1">
                    <FormControl>
                        <TextareaAutosize
                        placeholder="Type your message here..."
                        className="w-full resize-none bg-transparent border-none focus:ring-0 focus-visible:ring-0 p-0 text-base"
                        maxRows={5}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                if (form.getValues('topic').trim()) {
                                    form.handleSubmit(onSubmit)();
                                }
                            }
                        }}
                        {...field}
                        />
                    </FormControl>
                    <FormMessage className="absolute -bottom-5 left-2 text-xs" />
                    </FormItem>
                )}
                />
                <Button type="submit" disabled={isLoading} size="icon" className="flex-shrink-0">
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
