
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useReports } from '@/context/reports-context';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';

export function ReportsPageContent() {
  const { reports } = useReports();

  return (
    <main className="flex-grow p-4 md:p-8">
        <Card>
        <CardHeader>
            <CardTitle>Performance Reports</CardTitle>
            <CardDescription>A list of all generated performance reports.</CardDescription>
        </CardHeader>
        <CardContent>
            <ScrollArea className="h-[600px]">
            <div className="space-y-4">
                {reports.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                    No reports have been created yet.
                </div>
                )}
                {reports.map((report) => (
                <Card key={report.id}>
                    <CardHeader>
                    <CardTitle className="text-lg">{report.title}</CardTitle>
                    <CardDescription>
                        Generated on {format(new Date(report.date), 'PPpp')}
                    </CardDescription>
                    </CardHeader>
                    <CardContent>
                    <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-body bg-muted p-4 rounded-md">
                        {report.content}
                    </pre>
                    </CardContent>
                </Card>
                ))}
            </div>
            </ScrollArea>
        </CardContent>
        </Card>
    </main>
  );
}
