
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Paperclip, Mic, Send } from 'lucide-react';
import { Textarea } from '../ui/textarea';
import { cn } from '@/lib/utils';

interface ChatInputProps {
    onSendMessage: (message: string) => void;
}

export function ChatInput({ onSendMessage }: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSendMessage = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="relative">
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        className="pr-24 pl-20 min-h-[40px] h-10 max-h-40 resize-none"
        rows={1}
      />
      <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
        <Button variant="ghost" size="icon" type="button">
          <Paperclip className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" type="button">
          <Mic className="h-4 w-4" />
        </Button>
      </div>
       <Button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-primary to-green-700 text-primary-foreground hover:from-primary/90 hover:to-green-700/90" disabled={!message.trim()}>
            <Send className="h-4 w-4 mr-2" />
            Send
        </Button>
    </form>
  );
}
