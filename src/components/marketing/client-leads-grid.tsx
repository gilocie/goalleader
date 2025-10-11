
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
import { PlusCircle, MoreHorizontal, Mail, Phone, User, Loader2, Edit, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AddLeadDialog } from './add-lead-dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useSidebar } from '../layout/sidebar';
import type { Lead } from '@/lib/client-leads';
import { useMarketing } from '@/context/marketing-context';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';

export function ClientLeadsGrid() {
  const [isAddLeadOpen, setAddLeadOpen] = useState(false);
  const [isEditLeadOpen, setIsEditLeadOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [leadToEdit, setLeadToEdit] = useState<Lead | null>(null);

  const { toast } = useToast();
  const { open: isSidebarOpen } = useSidebar();
  const { leads, addLead, updateLead, deleteLead, loading } = useMarketing();

  const handleAddLead = (data: Omit<Lead, 'id'>) => {
    addLead(data);
    setAddLeadOpen(false);
    toast({
      title: "Lead Added",
      description: `${data.name} from ${data.company} has been added to your leads.`,
    });
  };

  const handleUpdateLead = (data: Lead) => {
    if (!leadToEdit) return;
    updateLead(leadToEdit.id!, data);
    setIsEditLeadOpen(false);
    setLeadToEdit(null);
    toast({
      title: "Lead Updated",
      description: `${data.name}'s information has been updated.`,
    });
  };

  const handleDeleteLead = () => {
    if (!leadToDelete) return;
    deleteLead(leadToDelete.id!);
    setLeadToDelete(null);
    toast({
      title: "Lead Deleted",
      description: `${leadToDelete.name} has been removed from your leads.`,
    });
  };
  
  const openEditDialog = (lead: Lead) => {
    setLeadToEdit(lead);
    setIsEditLeadOpen(true);
  }

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
            {loading ? (
                <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className={cn(
                    "grid grid-cols-1 gap-4",
                    isSidebarOpen ? "md:grid-cols-2 xl:grid-cols-3" : "md:grid-cols-3 xl:grid-cols-4"
                )}>
                {leads.map((lead) => (
                    <Card key={lead.id} className="flex flex-col bg-primary text-primary-foreground rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div className='flex flex-col items-start gap-2'>
                                <User className="h-8 w-8 text-primary-foreground/80" />
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
                                <DropdownMenuItem onClick={() => openEditDialog(lead)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setLeadToDelete(lead)} className="text-destructive focus:text-destructive">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                                <DropdownMenuLabel>Contact</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => window.location.href = `mailto:${lead.email}`}>
                                  <Mail className="mr-2 h-4 w-4" />
                                  Send Email
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => window.location.href = `tel:${lead.phone}`}>
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
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <AddLeadDialog
        isOpen={isAddLeadOpen}
        onOpenChange={setAddLeadOpen}
        onAddLead={handleAddLead}
      />
      {leadToEdit && (
        <AddLeadDialog
            isOpen={isEditLeadOpen}
            onOpenChange={setIsEditLeadOpen}
            onAddLead={handleUpdateLead as any}
            lead={leadToEdit}
        />
      )}
      <AlertDialog open={!!leadToDelete} onOpenChange={() => setLeadToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the lead for {leadToDelete?.name}.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteLead}>Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
