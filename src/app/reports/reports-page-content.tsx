
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useReports } from '@/context/reports-context';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, isWithinInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MoreHorizontal, Edit, Trash2, FileDown, Eye } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent as EditDialogContent, DialogDescription as EditDialogDescription, DialogFooter as EditDialogFooter, DialogHeader as EditDialogHeader, DialogTitle as EditDialogTitle, DialogClose } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useUser } from '@/context/user-context';
import { Report } from '@/context/reports-context';
import { Label } from '@/components/ui/label';


export function ReportsPageContent() {
  const { reports, deleteReport, updateReport } = useReports();
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [reportToDelete, setReportToDelete] = useState<Report | null>(null);
  const [reportToEdit, setReportToEdit] = useState<Report | null>(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [viewingReport, setViewingReport] = useState<Report | null>(null);
  const { user } = useUser();

  const filteredReports = useMemo(() => {
    let dateFiltered = reports;
    const now = new Date();

    if (dateFilter === 'last7') {
      const sevenDaysAgo = subDays(now, 7);
      dateFiltered = reports.filter(report => new Date(report.date) >= sevenDaysAgo);
    } else if (dateFilter === 'thisWeek') {
      dateFiltered = reports.filter(report => isWithinInterval(new Date(report.date), { start: startOfWeek(now), end: endOfWeek(now) }));
    } else if (dateFilter === 'thisMonth') {
      dateFiltered = reports.filter(report => isWithinInterval(new Date(report.date), { start: startOfMonth(now), end: endOfMonth(now) }));
    }

    if (!searchTerm) {
      return dateFiltered;
    }

    return dateFiltered.filter(report =>
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [reports, searchTerm, dateFilter]);

  const handleEditReport = () => {
    if (reportToEdit) {
      updateReport({ ...reportToEdit, title: editedTitle, content: editedContent });
      setReportToEdit(null);
    }
  };

  const downloadPdf = (report: Report) => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text(report.title, 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated for: ${user?.name || 'User'}`, 14, 30);
    doc.text(`Date: ${format(new Date(report.date), 'PPpp')}`, 14, 36);

    const splitContent = doc.splitTextToSize(report.content, 180);
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(splitContent, 14, 50);

    doc.save(`${report.title.replace(/\s/g, '_')}.pdf`);
  };

  return (
    <>
      <main className="flex-grow p-4 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Performance Reports</CardTitle>
            <CardDescription>A list of all generated performance reports.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title or content..."
                  className="w-full pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="last7">Last 7 days</SelectItem>
                  <SelectItem value="thisWeek">This Week</SelectItem>
                  <SelectItem value="thisMonth">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {filteredReports.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    {reports.length > 0 ? 'No reports match your search.' : 'No reports have been created yet.'}
                  </div>
                ) : (
                  filteredReports.map((report) => (
                    <Card key={report.id}>
                       <CardHeader className="flex flex-row justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{report.title}</CardTitle>
                          <CardDescription>
                            Generated on {format(new Date(report.date), 'PPpp')}
                          </CardDescription>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                             <Button variant="ghost" size="icon" className="h-8 w-8 -mt-2 -mr-2">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setReportToEdit(report); setEditedTitle(report.title); setEditedContent(report.content); }}>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Edit</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => downloadPdf(report)}>
                              <FileDown className="mr-2 h-4 w-4" />
                              <span>Download PDF</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setReportToDelete(report)} className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap font-body line-clamp-3 bg-muted p-4 rounded-md">
                          {report.content}
                        </p>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" onClick={() => setViewingReport(report)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Report
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </main>

      <AlertDialog open={!!reportToDelete} onOpenChange={(open) => !open && setReportToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the report.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (reportToDelete) {
                deleteReport(reportToDelete.id);
                setReportToDelete(null);
              }
            }}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!reportToEdit} onOpenChange={(open) => !open && setReportToEdit(null)}>
        <EditDialogContent>
          <div className="py-4 space-y-4">
             <div className='space-y-2'>
                <Label htmlFor="edit-title">Title</Label>
                <Input
                    id="edit-title"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                />
            </div>
             <div className='space-y-2'>
                <Label htmlFor="edit-content">Content</Label>
                <Textarea
                    id="edit-content"
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="h-24"
                />
            </div>
          </div>
          <EditDialogFooter>
            <Button variant="outline" onClick={() => setReportToEdit(null)}>Cancel</Button>
            <Button onClick={handleEditReport}>Save Changes</Button>
          </EditDialogFooter>
        </EditDialogContent>
      </Dialog>

      <Dialog open={!!viewingReport} onOpenChange={(open) => !open && setViewingReport(null)}>
        <EditDialogContent className="max-h-[80vh] flex flex-col">
          <EditDialogHeader>
            <EditDialogTitle>{viewingReport?.title}</EditDialogTitle>
            <EditDialogDescription>
              Generated on {viewingReport && format(new Date(viewingReport.date), 'PPpp')}
            </EditDialogDescription>
          </EditDialogHeader>
          <div className="py-4 flex-1 overflow-auto">
            <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-body">
              {viewingReport?.content}
            </pre>
          </div>
          <EditDialogFooter>
            <DialogClose asChild>
                <Button variant="outline">Close</Button>
            </DialogClose>
          </EditDialogFooter>
        </EditDialogContent>
      </Dialog>
    </>
  );
}
