
'use client';

import { useState } from 'react';
import { MoreHorizontal, PlusCircle, Search } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AddLeadDialog } from './add-lead-dialog';
import { ScrollArea } from '../ui/scroll-area';

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

  const handleAddLead = (newLead: Omit<Lead, 'id' | 'status'>) => {
    const leadToAdd: Lead = {
      ...newLead,
      id: `lead-${Date.now()}`,
      status: 'New',
    };
    setLeads([leadToAdd, ...leads]);
    setAddLeadOpen(false);
  }

  return (
    <>
    <Card>
      <CardHeader className='flex flex-row items-center justify-between'>
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
        <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search leads..." className="w-full pl-8" />
            </div>
            <Select>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
            </Select>
        </div>
        <ScrollArea className="w-full whitespace-nowrap">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                    <span className="sr-only">Actions</span>
                </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {leads.map((lead) => (
                <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell>{lead.company}</TableCell>
                    <TableCell>
                        <div className="text-sm">{lead.email}</div>
                        <div className="text-xs text-muted-foreground">{lead.phone}</div>
                    </TableCell>
                    <TableCell>{lead.service}</TableCell>
                    <TableCell>
                    <Badge variant="outline" className={statusStyles[lead.status]}>{lead.status}</Badge>
                    </TableCell>
                    <TableCell>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>Send Email</DropdownMenuItem>
                        <DropdownMenuItem>Mark as Contacted</DropdownMenuItem>
                        <DropdownMenuItem>Mark as Qualified</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
