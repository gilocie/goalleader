
'use client';

import { Building, Copy, GitBranch, Link as LinkIcon, MoreVertical, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { clients, Client } from '@/lib/super-admin-clients';
import { useToast } from '@/hooks/use-toast';

export function SuperAdminContent() {
    const { toast } = useToast();

    const handleCopy = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: `${label} Copied`,
            description: `The ${label.toLowerCase()} has been copied to your clipboard.`,
        });
    };

    return (
        <main className="p-4 md:p-8">
            <div className="flex items-center gap-4 mb-6">
                <Shield className="h-10 w-10 text-primary" />
                <div>
                    <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
                    <p className="text-muted-foreground">Manage all registered client instances.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Client Instances</CardTitle>
                    <CardDescription>A list of all companies that have completed the setup wizard.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Company</TableHead>
                                <TableHead>Admin Contact</TableHead>
                                <TableHead>Firebase Project</TableHead>
                                <TableHead>Domain</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {clients.map((client: Client) => (
                                <TableRow key={client.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-muted rounded-md">
                                                <Building className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <div className="font-medium">{client.companyName}</div>
                                                <div className="text-xs text-muted-foreground">{client.id}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{client.adminEmail}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-xs">{client.firebaseProjectId}</span>
                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopy(client.firebaseProjectId, 'Project ID')}>
                                                <Copy className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <a href={`https://${client.domain}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary underline">
                                            {client.domain}
                                            <LinkIcon className="h-3 w-3" />
                                        </a>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={client.status === 'Active' ? 'default' : 'destructive'} className={client.status === 'Active' ? 'bg-green-100 text-green-800' : ''}>
                                            {client.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                                <DropdownMenuItem>Manage Billing</DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive">Suspend</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </main>
    );
}
