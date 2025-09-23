
'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { ChatPageContent } from '@/components/chat/chat-page-content';

export default function ChatPage() {
  return (
    <AppLayout>
      <div className="flex-1 overflow-hidden h-full">
        <ChatPageContent />
      </div>
    </AppLayout>
  );
}
