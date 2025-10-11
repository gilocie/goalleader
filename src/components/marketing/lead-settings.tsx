
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { useMarketing } from '@/context/marketing-context';
import { Edit, Trash2, PlusCircle } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';

export function LeadSettings() {
    const { services, statuses, addService, updateService, deleteService, addStatus, updateStatus, deleteStatus } = useMarketing();
    
    const [newService, setNewService] = useState('');
    const [newStatus, setNewStatus] = useState('');
    
    const [editingService, setEditingService] = useState<{ index: number, value: string } | null>(null);
    const [editingStatus, setEditingStatus] = useState<{ index: number, value: string } | null>(null);

    const handleAddService = () => {
        if (newService.trim()) {
            addService(newService.trim());
            setNewService('');
        }
    };
    
    const handleUpdateService = () => {
        if (editingService !== null && editingService.value.trim()) {
            updateService(editingService.index, editingService.value.trim());
            setEditingService(null);
        }
    };
    
    const handleAddStatus = () => {
        if (newStatus.trim()) {
            addStatus(newStatus.trim());
            setNewStatus('');
        }
    };
    
    const handleUpdateStatus = () => {
        if (editingStatus !== null && editingStatus.value.trim()) {
            updateStatus(editingStatus.index, editingStatus.value.trim());
            setEditingStatus(null);
        }
    };

    return (
        <div className="grid md:grid-cols-2 gap-8">
            <Card>
                <CardHeader>
                    <CardTitle>Manage Services</CardTitle>
                    <CardDescription>Add, edit, or remove services offered to clients.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2 mb-4">
                        <Input placeholder="New service name..." value={newService} onChange={(e) => setNewService(e.target.value)} />
                        <Button onClick={handleAddService}><PlusCircle className="mr-2 h-4 w-4" /> Add</Button>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Service Name</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {services.map((service, index) => (
                                <TableRow key={index}>
                                    <TableCell>{service}</TableCell>
                                    <TableCell className="text-right">
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="ghost" size="icon" onClick={() => setEditingService({ index, value: service })}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader><DialogTitle>Edit Service</DialogTitle></DialogHeader>
                                                <Input value={editingService?.value} onChange={(e) => setEditingService(prev => prev ? {...prev, value: e.target.value} : null)} />
                                                <DialogFooter>
                                                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                                                    <DialogClose asChild><Button onClick={handleUpdateService}>Save</Button></DialogClose>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>This will delete the service "{service}". This action cannot be undone.</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => deleteService(index)}>Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Manage Statuses</CardTitle>
                    <CardDescription>Customize the stages of your client lead lifecycle.</CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="flex gap-2 mb-4">
                        <Input placeholder="New status name..." value={newStatus} onChange={(e) => setNewStatus(e.target.value)} />
                        <Button onClick={handleAddStatus}><PlusCircle className="mr-2 h-4 w-4" /> Add</Button>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Status Name</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {statuses.map((status, index) => (
                                <TableRow key={index}>
                                    <TableCell>{status}</TableCell>
                                    <TableCell className="text-right">
                                       <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="ghost" size="icon" onClick={() => setEditingStatus({ index, value: status })}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader><DialogTitle>Edit Status</DialogTitle></DialogHeader>
                                                <Input value={editingStatus?.value} onChange={(e) => setEditingStatus(prev => prev ? {...prev, value: e.target.value} : null)} />
                                                <DialogFooter>
                                                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                                                    <DialogClose asChild><Button onClick={handleUpdateStatus}>Save</Button></DialogClose>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>This will delete the status "{status}". This action cannot be undone.</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => deleteStatus(index)}>Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
