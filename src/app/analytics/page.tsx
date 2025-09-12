
'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AnalyticsPage() {
  return (
    <AppLayout>
      <main className="flex-grow p-4 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Analytics content goes here.</p>
          </CardContent>
        </Card>
      </main>
    </AppLayout>
  );
}
