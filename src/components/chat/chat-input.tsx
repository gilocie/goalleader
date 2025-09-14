
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Paperclip, Mic, Send } from 'lucide-react';

export function ChatInput() {
  return (
    <div className="relative">
      <Input
        placeholder="Type a message..."
        className="pr-24 pl-10"
      />
      <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center">
        <Button variant="ghost" size="icon">
          <Paperclip className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <Mic className="h-4 w-4" />
        </Button>
      </div>
       <Button className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-primary to-green-700 text-primary-foreground hover:from-primary/90 hover:to-green-700/90">
            <Send className="h-4 w-4 mr-2" />
            Send
        </Button>
    </div>
  );
}
