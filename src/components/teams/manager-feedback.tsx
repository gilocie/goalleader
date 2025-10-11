
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '../ui/scroll-area';

interface ManagerFeedbackProps {
    reportContent?: string | null;
}

export function ManagerFeedback({ reportContent }: ManagerFeedbackProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Manager Feedback</CardTitle>
                <CardDescription>Leave comments and feedback on performance.</CardDescription>
            </CardHeader>
            <CardContent>
                {reportContent && (
                    <div className="mb-4">
                        <h4 className="font-semibold text-sm mb-2">Submitted Report:</h4>
                        <ScrollArea className="h-32 bg-muted p-3 rounded-md border">
                            <pre className="text-xs whitespace-pre-wrap font-sans">
                                {decodeURIComponent(reportContent)}
                            </pre>
                        </ScrollArea>
                    </div>
                )}
                <form className="space-y-4">
                    <Textarea placeholder="Write your feedback here..." className="h-32" />
                    <Button className="w-full">Submit Feedback</Button>
                </form>
            </CardContent>
        </Card>
    );
}
