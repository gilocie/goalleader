
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Shield, Palette, KeyRound, Building, Users, Ban, Trash2, MessageSquare, UserCheck, Search, MoreHorizontal, Briefcase, GitBranch, Settings, LayoutDashboard } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { allUsers } from '@/lib/users';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';


function OverviewTabContent() {
    const stats = [
        { title: 'Total Users', value: allUsers.length, icon: Users },
        { title: 'Departments', value: 3, icon: Building },
        { title: 'Roles', value: 2, icon: Briefcase },
        { title: 'Branches', value: 1, icon: GitBranch },
    ];
    return (
        <Card>
            <CardHeader>
                <CardTitle>Overview</CardTitle>
                <CardDescription>A high-level view of your organization.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {stats.map(stat => {
                        const Icon = stat.icon;
                        return (
                             <Card key={stat.title} className="bg-gradient-to-br from-primary to-green-800 text-primary-foreground">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                                    <Icon className="h-4 w-4 text-primary-foreground/70" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stat.value}</div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    );
}

function BrandingTabContent() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Branding & Theme</CardTitle>
                <CardDescription>Customize the application's appearance. Changes will apply globally.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 max-w-2xl">
                <div className='space-y-2'>
                    <Label>Company Name</Label>
                    <Input defaultValue="GoalLeader" />
                </div>
                <div className='space-y-2'>
                    <Label>Logo</Label>
                    <Input type="file" />
                    <p className='text-xs text-muted-foreground'>Upload a PNG or SVG file. Max size: 2MB.</p>
                </div>
                 <div className='space-y-2'>
                    <Label>Hero Background Image</Label>
                    <Input type="file" />
                    <p className='text-xs text-muted-foreground'>Upload an image for the landing page hero. Recommended size: 1920x1080.</p>
                </div>
                
                <Tabs defaultValue="solid">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="solid">Solid Colors</TabsTrigger>
                        <TabsTrigger value="gradient">Gradient Colors</TabsTrigger>
                    </TabsList>
                    <TabsContent value="solid" className="pt-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className='space-y-2'>
                                <Label>Primary Color</Label>
                                <Input type="color" defaultValue="#27AE60" className='p-1 h-10' />
                            </div>
                            <div className='space-y-2'>
                                <Label>Background Color</Label>
                                <Input type="color" defaultValue="#F7FAFC" className='p-1 h-10' />
                            </div>
                             <div className='space-y-2'>
                                <Label>Accent Color</Label>
                                <Input type="color" defaultValue="#90EE90" className='p-1 h-10' />
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="gradient" className="pt-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                             <div className='space-y-2'>
                                <Label>Gradient End Color</Label>
                                <Input type="color" defaultValue="#1E8449" className='p-1 h-10' />
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>

                <Button>Save Branding</Button>
            </CardContent>
        </Card>
    )
}

function SettingsTabContent() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>Manage system-wide settings and integrations.</CardDescription>
            </CardHeader>
            <CardContent className="max-w-2xl">
                 <Tabs defaultValue="general" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="general">General</TabsTrigger>
                        <TabsTrigger value="security">Security</TabsTrigger>
                    </TabsList>
                    <TabsContent value="general" className="mt-6">
                        <div className="space-y-6">
                            <div className='space-y-2'>
                                <Label>Default Country</Label>
                                <Input placeholder="e.g., Malawi" />
                            </div>
                            <div className='space-y-2'>
                                <Label>Default City</Label>
                                <Input placeholder="e.g., Lilongwe" />
                            </div>
                            <Button>Save General Settings</Button>
                        </div>
                    </TabsContent>
                    <TabsContent value="security" className="mt-6">
                        <div className="space-y-6">
                            <div className='space-y-2'>
                                <Label htmlFor='gemini-key'>Google Gemini API Key</Label>
                                <Input id="gemini-key" type="password" placeholder="Enter your Gemini API Key" />
                            </div>
                            <div className='space-y-2'>
                                <Label htmlFor='admin-pin'>Admin PIN</Label>
                                <Input id="admin-pin" type="password" placeholder="Set or change your admin PIN" />
                            </div>
                            <Button>Save Security Settings</Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}

function UserManagementTabContent() {
    const users = allUsers.map(u => ({
        ...u,
        name: u.label,
        email: `${u.label.toLowerCase().replace(/\s/g, '.')}@goalleader.com`,
        department: u.label.includes('Patrick') ? 'ICT' : 'Customer Service',
        role: u.label.includes('Patrick') ? 'Admin' : 'Consultant'
    }));

    return (
         <Card>
            <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>View, manage, and assign roles to all users in the system.</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search by name or email..." className="w-full pl-8" />
                    </div>
                    <Select>
                        <SelectTrigger className="w-full md:w-[180px]">
                            <SelectValue placeholder="Filter by Department" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ict">ICT</SelectItem>
                            <SelectItem value="customer-service">Customer Service</SelectItem>
                            <SelectItem value="engineering">Engineering</SelectItem>
                            <SelectItem value="marketing">Marketing</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select>
                        <SelectTrigger className="w-full md:w-[180px]">
                            <SelectValue placeholder="Filter by Role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="consultant">Consultant</SelectItem>
                            <SelectItem value="team-leader">Team Leader</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <ScrollArea className="h-[400px]">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map(user => {
                                const avatar = PlaceHolderImages.find(p => p.id === user.value);
                                const isSelf = user.name === 'Patrick Achitabwino';
                                return (
                                    <TableRow key={user.value}>
                                        <TableCell className="py-2">
                                            <div className="flex items-center gap-3">
                                                <Avatar className='h-8 w-8'>
                                                    <AvatarImage src={avatar?.imageUrl} alt={user.label} className='object-cover object-top' />
                                                    <AvatarFallback>{user.label.slice(0, 2)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium text-sm">
                                                        {user.name} {isSelf && <span className="text-muted-foreground">(You)</span>}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-2">{user.department}</TableCell>
                                        <TableCell className="py-2">
                                            <Badge variant={user.role === 'Admin' ? 'default' : 'secondary'}>{user.role}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right py-2">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem><UserCheck className="mr-2 h-4 w-4" />Assign Role</DropdownMenuItem>
                                                    <DropdownMenuItem><MessageSquare className="mr-2 h-4 w-4" />Send Message</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-destructive focus:text-destructive"><Ban className="mr-2 h-4 w-4" />Ban User</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete User</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}

function DepartmentsTabContent() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Departments</CardTitle>
                <CardDescription>Manage organizational departments.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 max-w-2xl">
                 <div className='space-y-2'>
                    <Label>Add New Department</Label>
                    <div className='flex gap-2'>
                        <Input placeholder="e.g., Human Resources" />
                        <Button>Add Department</Button>
                    </div>
                </div>
                <p className='text-muted-foreground text-sm'>Existing: Customer Service, Engineering, Marketing</p>
            </CardContent>
        </Card>
    );
}

function RolesTabContent() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Roles</CardTitle>
                <CardDescription>Define and manage user roles in the system.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 max-w-2xl">
                 <div className='space-y-2'>
                    <Label>Add New Role</Label>
                    <div className='flex gap-2'>
                        <Input placeholder="e.g., Team Leader" />
                        <Button>Add Role</Button>
                    </div>
                </div>
                <p className='text-muted-foreground text-sm'>Existing: Admin, Consultant</p>
            </CardContent>
        </Card>
    );
}

function BranchesTabContent() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Branches</CardTitle>
                <CardDescription>Manage company branches and locations.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 max-w-2xl">
                 <div className='space-y-2'>
                    <Label>Add New Branch</Label>
                    <div className='flex gap-2'>
                        <Input placeholder="e.g., London Office" />
                        <Button>Add Branch</Button>
                    </div>
                </div>
                <p className='text-muted-foreground text-sm'>Existing: Main Office</p>
            </CardContent>
        </Card>
    );
}


const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, content: <OverviewTabContent /> },
    { id: 'branding', label: 'Branding', icon: Palette, content: <BrandingTabContent /> },
    { 
        id: 'organization', 
        label: 'Organization', 
        icon: Building,
        subItems: [
            { id: 'departments', label: 'Departments', content: <DepartmentsTabContent /> },
            { id: 'roles', label: 'Roles', content: <RolesTabContent /> },
            { id: 'branches', label: 'Branches', content: <BranchesTabContent /> },
        ]
    },
    { id: 'users', label: 'User Management', icon: Users, content: <UserManagementTabContent /> },
    { id: 'settings', label: 'Settings', icon: Settings, content: <SettingsTabContent /> },
];


export function AdminPageContent() {
    const [activeTab, setActiveTab] = useState('overview');
    const [activeSubTab, setActiveSubTab] = useState('departments');

    const renderContent = () => {
        if (activeTab === 'organization') {
            const subItem = navItems.find(i => i.id === 'organization')?.subItems?.find(s => s.id === activeSubTab);
            return subItem?.content;
        }
        const item = navItems.find(i => i.id === activeTab);
        return item?.content;
    };
    
    return (
        <main className="flex-grow p-4 md:p-8">
            <div className='flex items-center gap-3 mb-6'>
                <Shield className='h-8 w-8 text-primary' />
                <div>
                    <h1 className="text-2xl font-bold">Admin Control Panel</h1>
                    <p className="text-muted-foreground">System-wide configuration and management.</p>
                </div>
            </div>

            <div className="grid md:grid-cols-[200px_1fr] lg:grid-cols-[250px_1fr] gap-8">
                <nav className="flex flex-col gap-2">
                    {navItems.map(item => {
                        const Icon = item.icon;
                        if (item.subItems) {
                             return (
                                <Accordion key={item.id} type="single" collapsible defaultValue='organization'>
                                    <AccordionItem value="organization" className="border-b-0">
                                        <AccordionTrigger
                                            onClick={() => setActiveTab(item.id)}
                                            className={cn(
                                                "justify-start p-2 hover:no-underline w-full",
                                                activeTab === item.id ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'hover:bg-accent hover:text-accent-foreground'
                                            )}
                                        >
                                            <Icon className="mr-2 h-4 w-4" />
                                            {item.label}
                                        </AccordionTrigger>
                                        <AccordionContent className="pl-4">
                                            <div className="flex flex-col gap-1">
                                                {item.subItems.map(sub => (
                                                    <Button
                                                        key={sub.id}
                                                        variant={activeSubTab === sub.id && activeTab === 'organization' ? 'secondary' : 'ghost'}
                                                        className="justify-start"
                                                        onClick={() => {
                                                            setActiveTab('organization');
                                                            setActiveSubTab(sub.id);
                                                        }}
                                                    >
                                                        {sub.label}
                                                    </Button>
                                                ))}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                             )
                        }
                        return (
                            <Button 
                                key={item.id}
                                variant={activeTab === item.id ? 'default' : 'ghost'}
                                className="justify-start"
                                onClick={() => setActiveTab(item.id)}
                            >
                                <Icon className="mr-2 h-4 w-4" />
                                {item.label}
                            </Button>
                        )
                    })}
                </nav>

                <div className="md:col-span-1">
                    {renderContent()}
                </div>
            </div>
        </main>
    );
}
    

    

    

    