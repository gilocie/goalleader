
'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { ChatPageContent } from '@/components/chat/chat-page-content';
import { Header } from '@/components/layout/header';
import { cn } from '@/lib/utils';

export default function ChatPage() {
  return (
    <AppLayout>
      <div className={cn(
            "flex flex-1 flex-col relative"
        )}>
          <Header />
          <div className="flex flex-1 flex-col overflow-hidden">
            <ChatPageContent />
          </div>
        </div>
    </AppLayout>
  );
}
