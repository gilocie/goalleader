
'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { LifeBuoy } from 'lucide-react';

const faqs = [
    {
      question: "How do I reset my password?",
      answer: "You can reset your password by going to the 'Settings' tab on your profile page. You will find a 'Change Password' section there."
    },
    {
      question: "Where can I see my performance metrics?",
      answer: "The 'Performance' page provides a detailed overview of your completed projects and AI-driven feedback. The 'Analytics' page offers a higher-level view of team and project trends."
    },
    {
      question: "How does the AI task suggestion work?",
      answer: "When you open the 'Add New Task' dialog, you can click 'Use GoalLeader' to get AI-powered task suggestions based on your role and existing schedule. It helps you fill your open time slots with relevant work."
    },
    {
        question: "Can I edit a task once it's created?",
        answer: "Yes, you can edit a task from the 'Tasks' page. Click the three-dots menu on any task row and select 'Edit' to make changes."
    }
  ];

export default function SupportPage() {
  return (
    <AppLayout>
      <main className="flex-grow p-4 md:p-8">
        <div className="grid gap-8 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-primary/10 rounded-full">
                           <LifeBuoy className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-3xl">Support Center</CardTitle>
                    </div>
                    <CardDescription>Have an issue or a question? Fill out the form below and our team will get back to you.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="subject">Subject</Label>
                            <Input id="subject" placeholder="e.g., Issue with task timer" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" placeholder="Please describe your problem in detail..." className="h-32" />
                        </div>
                        <Button className="w-full">Submit Ticket</Button>
                    </form>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                    <CardDescription>Find answers to common questions below.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        {faqs.map((faq, index) => (
                             <AccordionItem key={index} value={`item-${index}`}>
                                <AccordionTrigger>{faq.question}</AccordionTrigger>
                                <AccordionContent>
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>
        </div>
      </main>
    </AppLayout>
  );
}
