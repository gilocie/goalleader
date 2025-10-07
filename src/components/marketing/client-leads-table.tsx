
'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { AddLeadDialog } from './add-lead-dialog';
import { Button } from '../ui/button';
import { PlusCircle } from 'lucide-react';

type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Lost';

type Lead = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  service: string;
  status: LeadStatus;
};

const initialLeads: Lead[] = [
  { id: 'lead-1', name: 'Sophia Davis', company: 'Innovate Inc.', email: 'sophia.davis@innovate.com', phone: '+265 999 123 456', service: 'UX/UI Design', status: 'New' },
  { id: 'lead-2', name: 'Liam Martinez', company: 'Solutions Co.', email: 'liam.martinez@solutions.co', phone: '+265 888 234 567', service: 'Backend Dev', status: 'Contacted' },
  { id: 'lead-3', name: 'Olivia Garcia', company: 'Quantum Tech', email: 'olivia.garcia@quantum.tech', phone: '+265 995 345 678', service: 'Frontend Dev', status: 'Qualified' },
  { id: 'lead-4', name: 'Noah Rodriguez', company: 'Synergy Corp', email: 'noah.rodriguez@synergy.com', phone: '+265 884 456 789', service: 'QA Testing', status: 'New' },
  { id: 'lead-5', name: 'Emma Wilson', company: 'Apex Enterprises', email: 'emma.wilson@apex.com', phone: '+265 991 567 890', service: 'Cloud Services', status: 'Lost' },
  { id: 'lead-6', name: 'James Brown', company: 'Digital Future', email: 'james.brown@digitalfuture.com', phone: '+265 992 345 678', service: 'UX/UI Design', status: 'New' },
  { id: 'lead-7', name: 'Isabella Chen', company: 'NextGen Solutions', email: 'isabella.chen@nextgen.com', phone: '+265 881 987 654', service: 'Backend Dev', status: 'Contacted' },
];

const statusStyles: Record<LeadStatus, string> = {
    'New': 'bg-blue-100 text-blue-800 border-blue-200',
    'Contacted': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Qualified': 'bg-green-100 text-green-800 border-green-200',
    'Lost': 'bg-red-100 text-red-800 border-red-200',
}

export function ClientLeadsTable() {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [isAddLeadOpen, setAddLeadOpen] = useState(false);

  const handleAddLead = (data: Omit<Lead, 'id' | 'status'>) => {
    const newLead: Lead = {
      ...data,
      id: `lead-${Date.now()}`,
      status: 'New',
    };
    setLeads(prev => [newLead, ...prev]);
    setAddLeadOpen(false);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Client Leads</CardTitle>
            <CardDescription>Manage promotional materials and leads.</CardDescription>
          </div>
          <Button onClick={() => setAddLeadOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Lead
          </Button>
        </CardHeader>
        <CardContent>
            <ScrollArea className="h-[400px] w-full border rounded-md">
              <Table>
                  <TableHeader>
                  <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Status</TableHead>
                  </TableRow>
                  </TableHeader>
                  <TableBody>
                  {leads.map((lead) => (
                      <TableRow key={lead.id}>
                      <TableCell className="font-medium whitespace-nowrap">{lead.name}</TableCell>
                      <TableCell className="whitespace-nowrap">{lead.company}</TableCell>
                      <TableCell>
                          <div className="text-sm whitespace-nowrap">{lead.email}</div>
                          <div className="text-xs text-muted-foreground whitespace-nowrap">{lead.phone}</div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{lead.service}</TableCell>
                      <TableCell>
                          <Badge variant="outline" className={statusStyles[lead.status]}>{lead.status}</Badge>
                      </TableCell>
                      </TableRow>
                  ))}
                  </TableBody>
              </Table>
            </ScrollArea>
        </CardContent>
      </Card>
      <AddLeadDialog 
        isOpen={isAddLeadOpen}
        onOpenChange={setAddLeadOpen}
        onAddLead={handleAddLead}
      />
    </>
  );
}
