
'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Send, User, Loader, Paperclip } from 'lucide-react';
import { chat, ChatInput } from '@/ai/flows/chat-flow';
import { getInitialMessage, InitialMessageInput } from '@/ai/flows/initial-message-flow';
import { ScrollArea } from '../ui/scroll-area';
import Textarea from 'react-textarea-autosize';
import { Logo } from '../icons';

type Message = {
  role: 'user' | 'model' | 'system';
  content: string;
};

// Hardcoded data for demonstration purposes
const tasks = [
  {
    name: 'Design landing page',
    status: 'In Progress',
    dueDate: '2024-07-25',
  },
  {
    name: 'Develop API for user authentication',
    status: 'Completed',
    dueDate: '2024-07-15',
  },
  {
    name: 'Setup database schema',
    status: 'Pending',
    dueDate: '2024-08-01',
  },
];

const meetings = [
  {
    title: 'Meeting with Arc Company',
    time: '02:00 pm - 04:00 pm',
  },
  {
    title: 'Project Alpha Deadline',
    time: 'Due: 25th July',
  },
];

const performance = 75;


export function GoalReaderAIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchInitialMessage = async () => {
      if (messages.length === 0) {
        setIsLoading(true);
        try {
          const initialInput: InitialMessageInput = {
            performance,
            tasks,
            meetings,
          };
          const response = await getInitialMessage(initialInput);
          const safeResponse = typeof response === 'string' && response.trim() ? response : 'Hello! How can I help you achieve your goals today?';
          const modelMessage: Message = { role: 'model', content: safeResponse };
          setMessages([modelMessage]);
        } catch (error) {
          console.error('Error getting initial message:', error);
          const errorMessage: Message = {
            role: 'model',
            content: 'Hello! How can I help you achieve your goals today?',
          };
          setMessages([errorMessage]);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchInitialMessage();
  }, []);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };

    // Add the user message to history first
    const updatedHistory = [...messages, userMessage];
    setMessages(updatedHistory);
    setInput('');
    setIsLoading(true);

    try {
      const chatInput: ChatInput = {
        history: updatedHistory.map(({ role, content }) => ({ role: role as 'user' | 'model', content })),
        message: input,
      };
      const response = await chat(chatInput);

      const modelMessage: Message = {
        role: 'model',
        content:
          typeof response === 'string' && response.trim()
            ? response
            : "I'm sorry, I couldn't generate a response. Please try again.",
      };
      setMessages((prev) => [...prev, modelMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        role: 'model',
        content: "I'm sorry, I couldn't generate a response. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          Goal Leader Chat
        </CardTitle>
        <CardDescription className="text-xs">
          Chat with your assistant to manage your goals.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
        <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message, index) => (
              (message.role !== 'system' && 
              <div
                key={index}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'model' && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                    <Logo className="h-5 w-5" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <User size={20} />
                  </div>
                )}
              </div>
              )
            ))}
            {isLoading && messages.length > 0 && (
              <div className="flex justify-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                  <Logo className="h-5 w-5" />
                </div>
                <div className="bg-muted rounded-lg p-3 flex items-center">
                  <Loader className="animate-spin" size={20} />
                </div>
              </div>
            )}
             {isLoading && messages.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <Loader className="animate-spin" size={30} />
              </div>
            )}
          </div>
        </ScrollArea>
        <form
          onSubmit={handleSendMessage}
          className="relative border-t pt-4"
        >
          <div className="relative flex items-center rounded-lg border bg-background">
            <Button variant="ghost" size="icon" className="shrink-0">
              <Paperclip className="w-5 h-5 text-muted-foreground" />
              <span className="sr-only">Attach file</span>
            </Button>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Goal Leader..."
              className="flex-1 resize-none border-0 bg-transparent p-2 focus-visible:outline-none"
              minRows={1}
              maxRows={4}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
             <Button
              type="submit"
              size="icon"
              disabled={isLoading || !input.trim()}
              className="m-1 rounded-md bg-gradient-to-r from-primary to-green-700 text-primary-foreground hover:from-primary/90 hover:to-green-700/90"
            >
              <Send />
              <span className="sr-only">Send</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
