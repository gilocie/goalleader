
'use client';

import { Building, Copy, GitBranch, Link as LinkIcon, MoreVertical, Shield, Users, AlertTriangle, CheckCircle, LayoutDashboard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { clients, Client } from '@/lib/super-admin-clients';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

const navItems = [
    { href: '/super-admin', label: 'Overview', icon: LayoutDashboard },
];

function SuperAdminSidebar() {
    return (
        <aside className="hidden md:flex flex-col gap-2 p-4 bg-background rounded-lg border self-start">
            {navItems.map(item => (
                <Button key={item.href} asChild variant="ghost" className="justify-start p-3 font-semibold text-base h-auto hover:bg-accent hover:text-accent-foreground">
                    <Link href={item.href}>
                         <item.icon className="mr-3 h-5 w-5" />
                         {item.label}
                    </Link>
                </Button>
            ))}
        </aside>
    );
}

const StatCard = ({ title, value, icon: Icon, description }: { title: string, value: string | number, icon: React.ElementType, description: string }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
    </Card>
);

export function SuperAdminContent() {
    const { toast } = useToast();

    const handleCopy = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: `${label} Copied`,
            description: `The ${label.toLowerCase()} has been copied to your clipboard.`,
        });
    };
    
    const activeClients = clients.filter(c => c.status === 'Active').length;
    const suspendedClients = clients.filter(c => c.status === 'Suspended').length;

    return (
        <main className="p-4 md:p-8">
            <div className="flex items-center gap-4 mb-8">
                <Shield className="h-10 w-10 text-primary" />
                <div>
                    <h1 className="text-3xl font-bold">Super Admin</h1>
                    <p className="text-muted-foreground">Global client instance management.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] lg:grid-cols-[250px_1fr] gap-8">
                <SuperAdminSidebar />

                <div className="space-y-8">
                    {/* Stat Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <StatCard title="Total Clients" value={clients.length} icon={Users} description="All registered client instances." />
                        <StatCard title="Active Clients" value={activeClients} icon={CheckCircle} description="Currently active and running." />
                        <StatCard title="Suspended" value={suspendedClients} icon={AlertTriangle} description="Temporarily disabled clients." />
                        <StatCard title="Incomplete Setups" value="2" icon={AlertTriangle} description="Clients who started but did not finish." />
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
                </div>
            </div>
        </main>
    );
}
