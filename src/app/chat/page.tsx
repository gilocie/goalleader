
'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { ChatPageContent } from '@/components/chat/chat-page-content';

export default function ChatPage() {
  return (
    <AppLayout>
      <div className="h-[calc(100vh-100px)] flex items-center justify-center">
        <ChatPageContent />
      </div>
    </AppLayout>
  );
}
