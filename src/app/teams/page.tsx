
'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TeamsPage() {
  return (
    <AppLayout>
      <main className="flex-grow p-4 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Teams content goes here.</p>
          </CardContent>
        </Card>
      </main>
    </AppLayout>
  );
}
