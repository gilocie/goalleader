'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { ChatPageContent } from '@/components/chat/chat-page-content';

export default function ChatPage() {
  return (
    <AppLayout>
      {/*
        Because AppLayout now correctly manages the height, ChatPageContent
        can be placed directly and its `h-full` class will work as intended,
        filling the main content area without causing a page scrollbar.
      */}
      <ChatPageContent />
    </AppLayout>
  );
}
