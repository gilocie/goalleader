
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { PlusCircle, MoreHorizontal, Mail, Phone } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AddLeadDialog } from './add-lead-dialog';
import { useToast } from '@/hooks/use-toast';

const initialLeads = [
    { name: 'Sophia Davis', company: 'Innovate Inc.', email: 'sophia@innovate.com', phone: '+1-202-555-0182', service: 'UX/UI Design', status: 'New' },
    { name: 'Liam Martinez', company: 'Quantum Solutions', email: 'liam@quantum.com', phone: '+1-305-555-0121', service: 'Frontend Dev', status: 'Contacted' },
    { name: 'Charlotte Rodriguez', company: 'Apex Enterprises', email: 'charlotte@apex.com', phone: '+1-415-555-0156', service: 'Backend Dev', status: 'Qualified' },
    { name: 'Noah Garcia', company: 'Synergy Corp', email: 'noah@synergy.com', phone: '+1-212-555-0199', service: 'QA Testing', status: 'Proposal Sent' },
    { name: 'Amelia Hernandez', company: 'Stellar Systems', email: 'amelia@stellar.com', phone: '+1-773-555-0112', service: 'Cloud Services', status: 'Negotiation' },
    { name: 'Oliver Wilson', company: 'Pinnacle Group', email: 'oliver@pinnacle.com', phone: '+1-650-555-0143', service: 'UX/UI Design', status: 'New' },
];

export function ClientLeadsTable() {
    const [leads, setLeads] = useState(initialLeads);
    const [isAddLeadOpen, setAddLeadOpen] = useState(false);
    const { toast } = useToast();

    const handleAddLead = (data: typeof initialLeads[0]) => {
        setLeads(prev => [data, ...prev]);
        setAddLeadOpen(false);
        toast({
            title: "Lead Added",
            description: `${data.name} from ${data.company} has been added to your leads.`,
        });
    }

  return (
    <>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Client Leads</CardTitle>
            <CardDescription>A list of your prospective clients.</CardDescription>
        </div>
        <Button onClick={() => setAddLeadOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Lead
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Service of Interest</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium whitespace-nowrap">{lead.name}</TableCell>
                  <TableCell className="whitespace-nowrap">{lead.company}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                        <span className="text-sm">{lead.email}</span>
                        <span className="text-xs text-muted-foreground">{lead.phone}</span>
                    </div>
                  </TableCell>
                  <TableCell>{lead.service}</TableCell>
                  <TableCell>
                    <Badge variant={lead.status === 'New' ? 'default' : 'secondary'}>{lead.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                                <Mail className="mr-2 h-4 w-4" />
                                Send Email
                            </DropdownMenuItem>
                             <DropdownMenuItem>
                                <Phone className="mr-2 h-4 w-4" />
                                Call
                            </DropdownMenuItem>
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
