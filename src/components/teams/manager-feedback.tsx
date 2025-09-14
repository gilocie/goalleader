
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export function ManagerFeedback() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Manager Feedback</CardTitle>
                <CardDescription>Leave comments and feedback on performance.</CardDescription>
            </CardHeader>
            <CardContent>
                <form className="space-y-4">
                    <Textarea placeholder="Write your feedback here..." className="h-32" />
                    <Button className="w-full">Submit Feedback</Button>
                </form>
            </CardContent>
        </Card>
    );
}
