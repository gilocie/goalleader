
'use client';

import { useState } from 'react';
import { Building, Copy, GitBranch, Link as LinkIcon, MoreVertical, Shield, Users, AlertTriangle, CheckCircle, LayoutDashboard, LifeBuoy, DollarSign, TrendingUp, Download, Search, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { clients, Client } from '@/lib/super-admin-clients';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';


type NavItem = {
    id: 'overview' | 'clients' | 'support';
    label: string;
    icon: React.ElementType;
};

const navItems: NavItem[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'support', label: 'Support', icon: LifeBuoy },
];

function SuperAdminSidebar({ activePage, setActivePage }: { activePage: string; setActivePage: (page: NavItem['id']) => void; }) {
    return (
        <aside className="hidden md:flex flex-col gap-2 p-4 bg-background rounded-lg border self-start">
            {navItems.map(item => (
                <Button 
                    key={item.id} 
                    variant={activePage === item.id ? 'default' : 'ghost'}
                    className={cn(
                        "justify-start p-3 font-semibold text-base h-auto",
                        activePage === item.id 
                            ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                            : 'hover:bg-accent hover:text-accent-foreground'
                    )}
                    onClick={() => setActivePage(item.id)}
                >
                     <item.icon className="mr-3 h-5 w-5" />
                     {item.label}
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

const OverviewPage = () => {
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
        <div className="space-y-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Clients" value={clients.length} icon={Users} description="All registered client instances." />
                <StatCard title="Active Clients" value={activeClients} icon={CheckCircle} description="Currently active and running." />
                <StatCard title="Total Sales" value="$12,450" icon={DollarSign} description="+15% from last month" />
                <StatCard title="Monthly Revenue" value="$4,150" icon={TrendingUp} description="Recurring and new subscriptions" />
            </div>
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                 <StatCard title="Suspended" value={suspendedClients} icon={AlertTriangle} description="Temporarily disabled clients." />
                <StatCard title="Incomplete Setups" value="2" icon={AlertTriangle} description="Clients who started but did not finish." />
                 <StatCard title="Downloads" value="+25k" icon={Download} description="Total app downloads by clients." />
                <StatCard title="Open Support Tickets" value="12" icon={LifeBuoy} description="Requires immediate attention." />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Client Instances</CardTitle>
                    <CardDescription>A list of the 5 most recently created companies.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {clients.slice(0,5).map((client: Client) => (
                        <Card key={client.id} className="p-4 space-y-4">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-muted rounded-lg">
                                        <Building className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <div className="font-semibold">{client.companyName}</div>
                                        <div className="text-xs text-muted-foreground font-mono">{client.id}</div>
                                    </div>
                                </div>
                                 <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem>View Details</DropdownMenuItem>
                                        <DropdownMenuItem>Manage Billing</DropdownMenuItem>
                                        <DropdownMenuItem className="text-destructive">Suspend</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Admin:</span>
                                    <span>{client.adminEmail}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Domain:</span>
                                     <a href={`https://${client.domain}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary underline">
                                        {client.domain}
                                        <LinkIcon className="h-3 w-3" />
                                    </a>
                                </div>
                                 <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Project ID:</span>
                                    <div className="flex items-center gap-1">
                                        <span className="font-mono text-xs">{client.firebaseProjectId}</span>
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopy(client.firebaseProjectId, 'Project ID')}>
                                            <Copy className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <CardFooter className="p-0 pt-4">
                                <Badge variant={client.status === 'Active' ? 'default' : 'destructive'} className={cn("w-full justify-center py-1", client.status === 'Active' ? 'bg-green-100 text-green-800' : '')}>
                                    {client.status}
                                </Badge>
                            </CardFooter>
                        </Card>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
};

const ClientsPage = () => {
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all');
  
    const filteredClients = clients.filter(client => {
      const statusMatch = activeTab === 'all' || client.status === activeTab;
      const searchMatch = client.companyName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          client.adminEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          client.firebaseProjectId.toLowerCase().includes(searchTerm.toLowerCase());
      return statusMatch && searchMatch;
    });

    const handleCopy = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: `${label} Copied`,
            description: `The ${label.toLowerCase()} has been copied to your clipboard.`,
        });
    };
  
    return (
      <Card>
        <CardHeader>
          <CardTitle>Client Management</CardTitle>
          <CardDescription>View, search, and manage all client instances.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4">
             <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search clients..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
             </div>
             <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
               <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="Active">Active</TabsTrigger>
                  <TabsTrigger value="Suspended">Suspended</TabsTrigger>
                  <TabsTrigger value="Incomplete">Incomplete</TabsTrigger>
               </TabsList>
             </Tabs>
          </div>
  
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClients.map((client: Client) => (
                <Card key={client.id} className="p-4 space-y-4">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-muted rounded-lg">
                                <Building className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div>
                                <div className="font-semibold">{client.companyName}</div>
                                <div className="text-xs text-muted-foreground font-mono">{client.id}</div>
                            </div>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                <DropdownMenuItem>Manage Billing</DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">Suspend</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Admin:</span>
                            <span>{client.adminEmail}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Domain:</span>
                            <a href={`https://${client.domain}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary underline">
                                {client.domain}
                                <LinkIcon className="h-3 w-3" />
                            </a>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Project ID:</span>
                            <div className="flex items-center gap-1">
                                <span className="font-mono text-xs">{client.firebaseProjectId}</span>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopy(client.firebaseProjectId, 'Project ID')}>
                                    <Copy className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    </div>
                    <CardFooter className="p-0 pt-4">
                        <Badge variant={client.status === 'Active' ? 'default' : 'destructive'} className={cn("w-full justify-center py-1", client.status === 'Active' ? 'bg-green-100 text-green-800' : '')}>
                            {client.status}
                        </Badge>
                    </CardFooter>
                </Card>
            ))}
            </div>
        </CardContent>
      </Card>
    )
  }

const supportTickets = [
    { id: 'TICKET-001', client: 'Innovate Inc.', subject: 'Billing issue', status: 'Open', lastUpdate: '2 hours ago' },
    { id: 'TICKET-002', client: 'Quantum Solutions', subject: 'Feature request: Dark mode', status: 'Open', lastUpdate: '8 hours ago' },
    { id: 'TICKET-003', client: 'Synergy Corp', subject: 'Cannot login', status: 'Closed', lastUpdate: '2 days ago' },
];

const SupportPage = () => {
    const [activeTab, setActiveTab] = useState('open');

    const filteredTickets = supportTickets.filter(t => t.status === (activeTab === 'open' ? 'Open' : 'Closed'));
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Support Tickets</CardTitle>
                <CardDescription>Manage and respond to client support requests.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                    <TabsList>
                        <TabsTrigger value="open">Open</TabsTrigger>
                        <TabsTrigger value="closed">Closed</TabsTrigger>
                    </TabsList>
                </Tabs>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Ticket ID</TableHead>
                            <TableHead>Client</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead>Last Update</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredTickets.map(ticket => (
                            <TableRow key={ticket.id}>
                                <TableCell className="font-mono">{ticket.id}</TableCell>
                                <TableCell>{ticket.client}</TableCell>
                                <TableCell>{ticket.subject}</TableCell>
                                <TableCell>{ticket.lastUpdate}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="outline" size="sm"><FileText className="mr-2 h-4 w-4" /> View</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

export function SuperAdminContent() {
    const [activePage, setActivePage] = useState<NavItem['id']>('overview');
    
    const renderContent = () => {
        switch(activePage) {
            case 'clients':
                return <ClientsPage />;
            case 'support':
                return <SupportPage />;
            case 'overview':
            default:
                return <OverviewPage />;
        }
    }

    return (
        <main className="p-4 md:p-8 w-full">
            <div className="flex items-center gap-4 mb-8">
                <Shield className="h-10 w-10 text-primary" />
                <div>
                    <h1 className="text-3xl font-bold">Super Admin</h1>
                    <p className="text-muted-foreground">Global client instance management.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] lg:grid-cols-[250px_1fr] gap-8">
                <SuperAdminSidebar activePage={activePage} setActivePage={setActivePage} />

                <div className="md:col-span-1">
                    {renderContent()}
                </div>
            </div>
        </main>
    );
}
