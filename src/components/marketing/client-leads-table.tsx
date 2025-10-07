
'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { PlusCircle, MoreHorizontal, Mail, Phone, User } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AddLeadDialog } from './add-lead-dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useSidebar } from '../layout/sidebar';

const initialLeads = [
  { name: 'Sophia Davis', company: 'Innovate Inc.', email: 'sophia@innovate.com', phone: '+265 99 123 4567', service: 'UX/UI Design', status: 'New' },
  { name: 'Liam Martinez', company: 'Quantum Solutions', email: 'liam@quantum.com', phone: '+265 88 234 5678', service: 'Frontend Dev', status: 'Contacted' },
  { name: 'Charlotte Rodriguez', company: 'Apex Enterprises', email: 'charlotte@apex.com', phone: '+265 99 345 6789', service: 'Backend Dev', status: 'Qualified' },
  { name: 'Noah Garcia', company: 'Synergy Corp', email: 'noah@synergy.com', phone: '+265 88 456 7890', service: 'QA Testing', status: 'Proposal Sent' },
  { name: 'Amelia Hernandez', company: 'Stellar Systems', email: 'amelia@stellar.com', phone: '+265 99 567 8901', service: 'Cloud Services', status: 'Negotiation' },
  { name: 'Oliver Wilson', company: 'Pinnacle Group', email: 'oliver@pinnacle.com', phone: '+265 88 678 9012', service: 'UX/UI Design', status: 'New' },
];

export function ClientLeadsGrid() {
  const [leads, setLeads] = useState(initialLeads);
  const [isAddLeadOpen, setAddLeadOpen] = useState(false);
  const { toast } = useToast();
  const { open: isSidebarOpen } = useSidebar();

  const handleAddLead = (data: typeof initialLeads[0]) => {
    setLeads(prev => [data, ...prev]);
    setAddLeadOpen(false);
    toast({
      title: "Lead Added",
      description: `${data.name} from ${data.company} has been added to your leads.`,
    });
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Client Leads</CardTitle>
            <CardDescription>A grid view of your prospective clients.</CardDescription>
          </div>
          <Button onClick={() => setAddLeadOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Lead
          </Button>
        </CardHeader>

        <CardContent>
          <ScrollArea className="h-[450px] w-full p-4">
            <div className={cn(
                "grid grid-cols-1 gap-4",
                isSidebarOpen ? "md:grid-cols-2 xl:grid-cols-3" : "md:grid-cols-3 xl:grid-cols-4"
            )}>
              {leads.map((lead, index) => (
                <Card key={index} className="flex flex-col bg-primary text-primary-foreground rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                        <div className='flex items-center gap-3'>
                            <User className="h-6 w-6 text-primary-foreground/80" />
                            <div>
                                <CardTitle className="text-xl">{lead.name}</CardTitle>
                                <CardDescription className="text-primary-foreground/80">{lead.company}</CardDescription>
                            </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10">
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
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow space-y-3">
                    <div>
                        <p className="text-xs font-semibold text-primary-foreground/70">CONTACT</p>
                        <p className="text-sm">{lead.email}</p>
                        <p className="text-sm">{lead.phone}</p>
                    </div>
                     <div>
                        <p className="text-xs font-semibold text-primary-foreground/70">SERVICE</p>
                        <p className="text-sm">{lead.service}</p>
                    </div>
                  </CardContent>
                  <CardFooter>
                     <Badge variant={lead.status === 'New' ? 'secondary' : 'outline'} className="w-full justify-center">
                        {lead.status}
                    </Badge>
                  </CardFooter>
                </Card>
              ))}
            </div>
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
