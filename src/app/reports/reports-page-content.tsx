
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useReports } from '@/context/reports-context';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, isWithinInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

export function ReportsPageContent() {
  const { reports } = useReports();
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');

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

  return (
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
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </main>
  );
}
