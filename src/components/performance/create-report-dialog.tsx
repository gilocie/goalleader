
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Task } from '@/context/time-tracker-context';
import { useReports } from '@/context/reports-context';
import { generateReport, GenerateReportInput } from '@/ai/flows/generate-report-flow';
import { refineText, RefineTextInput } from '@/ai/flows/refine-text-flow';
import { Bot, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import type { Timestamp } from 'firebase/firestore';
import { useNotifications } from '@/context/notification-context';
import { useUser } from '@/context/user-context';

interface CreateReportDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  tasks: Task[];
  period: 'This Week' | 'This Month';
}

const COMPANY_KPI = 80;

export function CreateReportDialog({
  isOpen,
  onOpenChange,
  tasks,
  period,
}: CreateReportDialogProps) {
  const [reportContent, setReportContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addReport } = useReports();
  const { addNotification } = useNotifications();
  const { user } = useUser();
  const router = useRouter();

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      const performance = tasks.length > 0 ? 100 : 0; // Simplified for now
      const input: GenerateReportInput = {
        tasks: tasks.map(t => {
            let endTimeFormatted = 'N/A';
            if (t.endTime) {
                const date = (t.endTime as Timestamp).toDate ? (t.endTime as Timestamp).toDate() : new Date(t.endTime as string);
                endTimeFormatted = format(date, 'MMM d, yy');
            }
            return {
                name: t.name,
                status: t.status,
                dueDate: t.dueDate,
                duration: t.duration,
                endTime: endTimeFormatted
            }
        }),
        period,
        kpi: COMPANY_KPI,
        performance,
      };
      const result = await generateReport(input);
      setReportContent(result.fullReport || '');
    } catch (error) {
      console.error('Failed to generate report:', error);
      setReportContent('Could not generate report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const submitReport = (finalReportContent: string) => {
    const reportTitle = `Performance Report - ${period} - ${format(new Date(), 'PP')}`;
    addReport({
        title: reportTitle,
        content: finalReportContent,
    });
    
    if (user) {
        addNotification({
            type: 'report',
            title: `New Report from ${user.name}`,
            message: `A new performance report titled "${reportTitle}" is ready for your review.`,
            author: user.name,
            link: `/teams/${user.id}`
        });
    }

    onOpenChange(false);
    setReportContent('');
    router.push('/reports');
  };

  const handleConfirm = async () => {
    if (!reportContent.trim()) return;

    setIsSubmitting(true);
    try {
        const refineInput: RefineTextInput = {
            report: reportContent,
            tasks: tasks.map(t => {
                let endTimeFormatted = 'N/A';
                if (t.endTime) {
                    const date = (t.endTime as Timestamp).toDate ? (t.endTime as Timestamp).toDate() : new Date(t.endTime as string);
                    endTimeFormatted = format(date, 'MMM d, yy');
                }
                return { name: t.name, endTime: endTimeFormatted };
            }),
        };
        const finalReport = await refineText(refineInput);
        submitReport(finalReport);

    } catch (error) {
        console.error('Failed to refine report:', error);
        // If AI refinement fails, save the original content.
        submitReport(reportContent);
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const handleClose = (open: boolean) => {
    if (!open) {
      setReportContent('');
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Performance Report</DialogTitle>
          <DialogDescription>
            Generate a report for '{period}'. You can write it manually or ask AI to create a draft for you.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
            <Textarea
              value={reportContent}
              onChange={(e) => setReportContent(e.target.value)}
              placeholder="Write your performance summary here, or click 'Generate with AI' to get a draft..."
              className="h-64"
            />
          <Button onClick={handleGenerateReport} disabled={isGenerating}>
            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
            Generate with AI
          </Button>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!reportContent.trim() || isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Confirm and Save Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
