
'use client';

import { useState } from 'react';
import { Building, Copy, GitBranch, Link as LinkIcon, MoreVertical, Shield, Users, AlertTriangle, CheckCircle, LayoutDashboard, LifeBuoy, DollarSign, TrendingUp, Download, Search, FileText, List, LayoutGrid, Mail, Phone, Calendar, Settings, LogOut, PanelLeft } from 'lucide-react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { format } from 'date-fns';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Label } from '@/components/ui/label';


type NavItem = {
    id: 'overview' | 'clients' | 'support' | 'settings';
    label: string;
    icon: React.ElementType;
};

const navItems: NavItem[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'support', label: 'Support', icon: LifeBuoy },
    { id: 'settings', label: 'Settings', icon: Settings },
];

function SuperAdminSidebar({ activePage, setActivePage, isCollapsed, onToggleCollapse }: { activePage: string; setActivePage: (page: NavItem['id']) => void; isCollapsed: boolean; onToggleCollapse: () => void; }) {
    const handleLogout = () => {
        // In a real app, this would handle logout logic
        console.log("Logout clicked");
    };

    const renderLink = (item: NavItem) => {
        const isActive = activePage === item.id;
        const commonClasses = "justify-start p-3 font-semibold text-base h-auto w-full transition-all";
        
        if (isCollapsed) {
            return (
                <TooltipProvider key={item.id} delayDuration={0}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                             <Button 
                                variant={isActive ? 'default' : 'ghost'}
                                className={cn(
                                    commonClasses, 
                                    'justify-center',
                                    isActive 
                                        ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                                        : 'hover:bg-accent hover:text-accent-foreground'
                                )}
                                onClick={() => setActivePage(item.id)}
                            >
                                 <item.icon className="h-5 w-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                            <p>{item.label}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )
        }
        
        return (
            <Button 
                key={item.id} 
                variant={isActive ? 'default' : 'ghost'}
                className={cn(
                    commonClasses,
                    isActive 
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                        : 'hover:bg-accent hover:text-accent-foreground'
                )}
                onClick={() => setActivePage(item.id)}
            >
                 <item.icon className="mr-3 h-5 w-5" />
                 <span>{item.label}</span>
            </Button>
        )
    };
    
    return (
        <aside className={cn("hidden md:flex flex-col gap-2 p-2 bg-background rounded-lg border self-start transition-all duration-300", isCollapsed ? 'items-center' : '')}>
            <div className={cn("flex-1 w-full space-y-2", isCollapsed ? "flex flex-col items-center" : "")}>
                {navItems.map(item => renderLink(item))}
            </div>
            <div className="mt-auto w-full space-y-2">
                 <TooltipProvider delayDuration={0}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" className={cn("w-full justify-start", isCollapsed && "justify-center")} onClick={() => setActivePage('settings')}>
                                <Settings className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
                                {!isCollapsed && <span>Settings</span>}
                            </Button>
                        </TooltipTrigger>
                        {isCollapsed && <TooltipContent side="right"><p>Settings</p></TooltipContent>}
                    </Tooltip>
                </TooltipProvider>
                 <TooltipProvider delayDuration={0}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" className={cn("w-full justify-start", isCollapsed && "justify-center")} onClick={handleLogout}>
                                <LogOut className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
                                {!isCollapsed && <span>Logout</span>}
                            </Button>
                        </TooltipTrigger>
                        {isCollapsed && <TooltipContent side="right"><p>Logout</p></TooltipContent>}
                    </Tooltip>
                </TooltipProvider>
            </div>
            <Button variant="outline" size="icon" className="h-8 w-8 mt-4" onClick={onToggleCollapse}>
                <PanelLeft className={cn("h-4 w-4 transition-transform", isCollapsed && 'rotate-180')} />
            </Button>
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
    const [clientList, setClientList] = useState(clients);

    const handleCopy = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: `${label} Copied`,
            description: `The ${label.toLowerCase()} has been copied to your clipboard.`,
        });
    };
    
    const activeClients = clientList.filter(c => c.status === 'Active').length;
    const suspendedClients = clientList.filter(c => c.status === 'Suspended').length;

    return (
        <div className="space-y-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Clients" value={clientList.length} icon={Users} description="All registered client instances." />
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
                    {clientList.slice(0,5).map((client: Client) => (
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

const ClientCard = ({ client, layout, onCopy, onSuspend, onActivate, onViewDetails }: { client: Client, layout: 'list' | 'grid', onCopy: (text: string, label: string) => void, onSuspend: (client: Client) => void, onActivate: (client: Client) => void, onViewDetails: (client: Client) => void }) => {
    const { toast } = useToast();
    const handleManageBilling = () => {
        toast({ title: 'Coming Soon', description: 'Billing management will be available in a future update.' });
    };
    
    if (layout === 'list') {
        return (
            <Card className="p-3">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-muted rounded-lg">
                        <Building className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 grid grid-cols-4 items-center gap-4">
                        <div className="font-semibold truncate">{client.companyName}</div>
                        <div className="text-sm text-muted-foreground truncate">{client.adminEmail}</div>
                         <a href={`https://${client.domain}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary underline text-sm truncate">
                            {client.domain} <LinkIcon className="h-3 w-3" />
                        </a>
                        <Badge variant={client.status === 'Active' ? 'default' : 'destructive'} className={cn("w-fit justify-center py-1", client.status === 'Active' ? 'bg-green-100 text-green-800' : '')}>
                           {client.status}
                        </Badge>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onViewDetails(client)}>View Details</DropdownMenuItem>
                            <DropdownMenuItem onClick={handleManageBilling}>Manage Billing</DropdownMenuItem>
                            {client.status === 'Active' ? (
                                <DropdownMenuItem className="text-destructive" onClick={() => onSuspend(client)}>Suspend</DropdownMenuItem>
                            ) : (
                                <DropdownMenuItem onClick={() => onActivate(client)}>Activate</DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </Card>
        )
    }

    return (
        <Card className="p-4 space-y-4">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-muted rounded-lg"><Building className="h-6 w-6 text-muted-foreground" /></div>
                    <div>
                        <div className="font-semibold">{client.companyName}</div>
                        <div className="text-xs text-muted-foreground font-mono">{client.id}</div>
                    </div>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onViewDetails(client)}>View Details</DropdownMenuItem>
                        <DropdownMenuItem onClick={handleManageBilling}>Manage Billing</DropdownMenuItem>
                        {client.status === 'Active' ? (
                            <DropdownMenuItem className="text-destructive" onClick={() => onSuspend(client)}>Suspend</DropdownMenuItem>
                        ) : (
                            <DropdownMenuItem onClick={() => onActivate(client)}>Activate</DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Admin:</span><span>{client.adminEmail}</span></div>
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Domain:</span>
                    <a href={`https://${client.domain}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary underline">{client.domain}<LinkIcon className="h-3 w-3" /></a>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Project ID:</span>
                    <div className="flex items-center gap-1">
                        <span className="font-mono text-xs">{client.firebaseProjectId}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onCopy(client.firebaseProjectId, 'Project ID')}><Copy className="h-3 w-3" /></Button>
                    </div>
                </div>
            </div>
            <CardFooter className="p-0 pt-4">
                <Badge variant={client.status === 'Active' ? 'default' : 'destructive'} className={cn("w-full justify-center py-1", client.status === 'Active' ? 'bg-green-100 text-green-800' : '')}>{client.status}</Badge>
            </CardFooter>
        </Card>
    )
}

const ClientsPage = () => {
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [layout, setLayout] = useState<'list' | 'grid'>('list');
    const [clientList, setClientList] = useState(clients);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [suspendConfirm, setSuspendConfirm] = useState<Client | null>(null);
    const [activateConfirm, setActivateConfirm] = useState<Client | null>(null);
  
    const filteredClients = clientList.filter(client => {
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

    const handleSuspend = () => {
        if (!suspendConfirm) return;
        setClientList(prev => prev.map(c => c.id === suspendConfirm.id ? { ...c, status: 'Suspended' } : c));
        setSuspendConfirm(null);
        toast({ title: 'Client Suspended', description: `${suspendConfirm.companyName} has been suspended.` });
    };

    const handleActivate = () => {
        if (!activateConfirm) return;
        setClientList(prev => prev.map(c => c.id === activateConfirm.id ? { ...c, status: 'Active' } : c));
        setActivateConfirm(null);
        toast({ title: 'Client Activated', description: `${activateConfirm.companyName} has been activated.` });
    };
  
    return (
      <>
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
               <div className="flex items-center gap-2">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto hidden sm:block">
                      <TabsList>
                          <TabsTrigger value="all">All</TabsTrigger>
                          <TabsTrigger value="Active">Active</TabsTrigger>
                          <TabsTrigger value="Suspended">Suspended</TabsTrigger>
                          <TabsTrigger value="Incomplete">Incomplete</TabsTrigger>
                      </TabsList>
                  </Tabs>
                  <Button variant={layout === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setLayout('list')}><List className="h-4 w-4" /></Button>
                  <Button variant={layout === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setLayout('grid')}><LayoutGrid className="h-4 w-4" /></Button>
              </div>
            </div>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto sm:hidden">
                 <TabsList className='grid grid-cols-4 w-full'>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="Active">Active</TabsTrigger>
                    <TabsTrigger value="Suspended">Suspended</TabsTrigger>
                    <TabsTrigger value="Incomplete">Incomplete</TabsTrigger>
                 </TabsList>
               </Tabs>
    
            <div className={cn("gap-4", layout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'space-y-2')}>
              {filteredClients.map((client: Client) => (
                  <ClientCard key={client.id} client={client} layout={layout} onCopy={handleCopy} onSuspend={setSuspendConfirm} onActivate={setActivateConfirm} onViewDetails={setSelectedClient} />
              ))}
              </div>
          </CardContent>
        </Card>
        
        {/* View Details Dialog */}
        <Dialog open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{selectedClient?.companyName}</DialogTitle>
                    <DialogDescription>ID: {selectedClient?.id}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4 text-sm">
                    <p><strong>Admin Email:</strong> {selectedClient?.adminEmail}</p>
                    <p><strong>Firebase Project ID:</strong> {selectedClient?.firebaseProjectId}</p>
                    <p><strong>Domain:</strong> <a href={`https://${selectedClient?.domain}`} target="_blank" rel="noopener noreferrer" className="text-primary underline">{selectedClient?.domain}</a></p>
                    <p><strong>Status:</strong> {selectedClient?.status}</p>
                    <p><strong>Created At:</strong> {selectedClient && format(new Date(selectedClient.createdAt), 'PPP')}</p>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Close</Button></DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        
        {/* Suspend Confirmation */}
        <AlertDialog open={!!suspendConfirm} onOpenChange={() => setSuspendConfirm(null)}>
            <AlertDialogContent>
                <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will suspend {suspendConfirm?.companyName}'s account.</AlertDialogDescription></AlertDialogHeader>
                <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleSuspend}>Suspend</AlertDialogAction></AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        {/* Activate Confirmation */}
        <AlertDialog open={!!activateConfirm} onOpenChange={() => setActivateConfirm(null)}>
            <AlertDialogContent>
                <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will reactivate {activateConfirm?.companyName}'s account.</AlertDialogDescription></AlertDialogHeader>
                <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleActivate}>Activate</AlertDialogAction></AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      </>
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

const SettingsPage = () => {
    const { toast } = useToast();

    const handleAction = (action: string) => {
        toast({
            title: 'Action Triggered',
            description: `${action} functionality is not yet implemented.`,
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>Manage global platform settings.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="account" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="account">Account</TabsTrigger>
                        <TabsTrigger value="security">Security</TabsTrigger>
                        <TabsTrigger value="billing">Billing</TabsTrigger>
                        <TabsTrigger value="register">Register Admin</TabsTrigger>
                    </TabsList>
                    <TabsContent value="account" className="mt-6">
                        <div className="space-y-6 max-w-2xl">
                             <div className="space-y-2">
                                <Label htmlFor="admin-name">Name</Label>
                                <Input id="admin-name" defaultValue="Super Admin" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="admin-email">Email</Label>
                                <Input id="admin-email" type="email" defaultValue="super@goalleader.com" />
                            </div>
                            <Button onClick={() => handleAction('Update Account')}>Save Changes</Button>
                        </div>
                    </TabsContent>
                    <TabsContent value="security" className="mt-6">
                         <div className="space-y-6 max-w-2xl">
                             <div className="space-y-2">
                                <Label htmlFor="current-password">Current Password</Label>
                                <Input id="current-password" type="password" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="new-password">New Password</Label>
                                <Input id="new-password" type="password" />
                            </div>
                            <Button onClick={() => handleAction('Change Password')}>Change Password</Button>
                        </div>
                    </TabsContent>
                    <TabsContent value="billing" className="mt-6">
                         <div className="space-y-6 max-w-2xl">
                            <p className="text-sm">Your current plan: <strong>Super Admin Unlimited</strong></p>
                            <Button variant="outline" onClick={() => handleAction('Manage Subscription')}>Manage Subscription</Button>
                        </div>
                    </TabsContent>
                    <TabsContent value="register" className="mt-6">
                        <div className="space-y-6 max-w-2xl">
                             <div className="space-y-2">
                                <Label htmlFor="new-admin-name">Full Name</Label>
                                <Input id="new-admin-name" placeholder="Enter full name" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="new-admin-email">Email</Label>
                                <Input id="new-admin-email" type="email" placeholder="Enter email address" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="new-admin-password">Password</Label>
                                <Input id="new-admin-password" type="password" placeholder="Enter temporary password" />
                            </div>
                            <Button onClick={() => handleAction('Register New Admin')}>Register Admin</Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
};

export function SuperAdminContent() {
    const [activePage, setActivePage] = useState<NavItem['id']>('overview');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    
    const renderContent = () => {
        switch(activePage) {
            case 'clients':
                return <ClientsPage />;
            case 'support':
                return <SupportPage />;
            case 'settings':
                return <SettingsPage />;
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

            <div className={cn("grid grid-cols-1 gap-8", isSidebarCollapsed ? "md:grid-cols-[80px_1fr]" : "md:grid-cols-[250px_1fr]")}>
                <SuperAdminSidebar 
                    activePage={activePage} 
                    setActivePage={setActivePage} 
                    isCollapsed={isSidebarCollapsed}
                    onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                />

                <div className="md:col-span-1">
                    {renderContent()}
                </div>
            </div>
        </main>
    );
}

    