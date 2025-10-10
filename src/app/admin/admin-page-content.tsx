
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Shield, Palette, Building, Users, Ban, Trash2, MessageSquare, UserCheck, Search, MoreHorizontal, Briefcase, GitBranch, Settings, LayoutDashboard, LucideIcon, Edit, PlusCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useBranding } from '@/context/branding-context';
import { Separator } from '@/components/ui/separator';
import { useUser } from '@/context/user-context';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

function OverviewTabContent() {
    const { allTeamMembers } = useUser();
    const stats = [
        { title: 'Total Users', value: allTeamMembers.length, icon: Users },
        { title: 'Departments', value: [...new Set(allTeamMembers.map(m => m.department))].length, icon: Building },
        { title: 'Roles', value: [...new Set(allTeamMembers.map(m => m.role))].length, icon: Briefcase },
        { title: 'Branches', value: 1, icon: GitBranch },
    ];
    return (
        <Card>
            <CardHeader>
                <CardTitle>Overview</CardTitle>
                <CardDescription>A high-level view of your organization.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    {stats.map(stat => {
                        const Icon = stat.icon;
                        return (
                             <Card key={stat.title} className="bg-primary text-primary-foreground">
                                <CardContent className="flex flex-col items-center justify-center h-full p-4">
                                    <Icon className="h-6 w-6 text-primary-foreground/80 mb-1" />
                                    <div>
                                        <p className="text-sm font-medium text-center">{stat.title}</p>
                                        <p className="text-2xl font-bold text-center">{stat.value}</p>
                                    </div>
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
    const { branding, saveBranding, resetBranding } = useBranding();
    const [localBranding, setLocalBranding] = useState(branding);

    useEffect(() => {
        setLocalBranding(branding);
    }, [branding]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLocalBranding(prev => ({...prev, [name]: value}));
    };

    const handleSave = () => {
        saveBranding(localBranding);
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Branding & Theme</CardTitle>
                <CardDescription>Customize the application's appearance. Changes will apply globally.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 max-w-2xl">
                <div className='space-y-2'>
                    <Label>Company Name</Label>
                    <Input name="companyName" value={localBranding.companyName} onChange={handleChange} />
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
                
                <Card className='p-4'>
                    <Label>Theme Colors</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                        <div className='space-y-2'>
                            <Label>Primary Color</Label>
                            <Input type="color" name="primaryColor" value={localBranding.primaryColor} onChange={handleChange} className='p-1 h-10' />
                        </div>
                        <div className='space-y-2'>
                            <Label>Background Color</Label>
                            <Input type="color" name="backgroundColor" value={localBranding.backgroundColor} onChange={handleChange} className='p-1 h-10' />
                        </div>
                         <div className='space-y-2'>
                            <Label>Accent Color</Label>
                            <Input type="color" name="accentColor" value={localBranding.accentColor} onChange={handleChange} className='p-1 h-10' />
                        </div>
                    </div>
                </Card>


                <div className="flex gap-2">
                    <Button onClick={handleSave}>Save Branding</Button>
                    <Button variant="outline" onClick={resetBranding}>Reset Branding</Button>
                </div>
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
    const { user: currentUser, allTeamMembers } = useUser();
    const users = allTeamMembers.map(u => ({
        ...u,
        email: `${u.name.toLowerCase().replace(/\s/g, '.')}@goalleader.com`,
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
                                const avatar = PlaceHolderImages.find(p => p.id === user.id);
                                const isSelf = user.id === currentUser?.id;
                                return (
                                    <TableRow key={user.id}>
                                        <TableCell className="py-2">
                                            <div className="flex items-center gap-3">
                                                <Avatar className='h-8 w-8'>
                                                    <AvatarImage src={avatar?.imageUrl} alt={user.name} className='object-cover object-top' />
                                                    <AvatarFallback>{user.name.slice(0, 2)}</AvatarFallback>
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
    const { allTeamMembers, user } = useUser();
    const isAdmin = user?.role === 'Admin';
    const [departments, setDepartments] = useState([...new Set(allTeamMembers.map(m => m.department))]);
    const [newDepartment, setNewDepartment] = useState('');
    const [editingDepartment, setEditingDepartment] = useState<{ oldName: string, newName: string } | null>(null);

    const handleAddDepartment = () => {
        if (newDepartment && !departments.includes(newDepartment)) {
            setDepartments(prev => [...prev, newDepartment]);
            setNewDepartment('');
        }
    };

    const handleUpdateDepartment = () => {
        if (editingDepartment) {
            setDepartments(prev => prev.map(d => d === editingDepartment.oldName ? editingDepartment.newName : d));
            setEditingDepartment(null);
        }
    };

    const handleDeleteDepartment = (deptName: string) => {
        setDepartments(prev => prev.filter(d => d !== deptName));
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Departments</CardTitle>
                <CardDescription>Manage organizational departments.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {isAdmin && (
                        <div className="space-y-2">
                            <Label htmlFor="new-department">Add New Department</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="new-department"
                                    placeholder="e.g., Human Resources"
                                    value={newDepartment}
                                    onChange={(e) => setNewDepartment(e.target.value)}
                                />
                                <Button onClick={handleAddDepartment}>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Add
                                </Button>
                            </div>
                        </div>
                    )}
                    <ScrollArea className="h-72">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Department Name</TableHead>
                                    {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {departments.map((dept) => (
                                    <TableRow key={dept}>
                                        <TableCell>{dept}</TableCell>
                                        {isAdmin && (
                                            <TableCell className="text-right">
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Edit Department</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                <Input defaultValue={dept} onChange={(e) => setEditingDepartment({ oldName: dept, newName: e.target.value })} className="mt-4" />
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel onClick={() => setEditingDepartment(null)}>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={handleUpdateDepartment}>Save</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                     <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This action cannot be undone. This will permanently delete the department.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDeleteDepartment(dept)}>Delete</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </div>
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
                <div className='space-y-4'>
                    <Label>Add New Role</Label>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <Input placeholder="e.g., Team Leader" />
                        <Select>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Department" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ict">ICT</SelectItem>
                                <SelectItem value="customer-service">Customer Service</SelectItem>
                                <SelectItem value="engineering">Engineering</SelectItem>
                                <SelectItem value="marketing">Marketing</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button>Add Role</Button>
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

type NavItem = {
    id: string;
    label: string;
    icon: LucideIcon;
    content: React.ReactNode;
    subItems?: undefined;
    type?: undefined;
} | {
    id: string;
    label: string;
    icon: LucideIcon;
    content?: undefined;
    subItems: {
        id: string;
        label: string;
        content: React.ReactNode;
    }[];
    type?: undefined;
} | {
    type: 'divider';
    id?: undefined;
    label?: undefined;
    icon?: undefined;
    content?: undefined;
    subItems?: undefined;
};


const navItems: NavItem[] = [
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
    { type: 'divider' },
    { id: 'settings', label: 'Settings', icon: Settings, content: <SettingsTabContent /> },
];


export function AdminPageContent() {
    const [activeTab, setActiveTab] = useState('overview');
    const [activeSubTab, setActiveSubTab] = useState('departments');

    const renderContent = () => {
        if (activeTab === 'organization') {
            const subItem = (navItems.find(i => i.id === 'organization' && i.subItems) as Extract<NavItem, { subItems: any[] }>)?.subItems?.find(s => s.id === activeSubTab);
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

            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] lg:grid-cols-[250px_1fr] gap-8">
                <nav className="hidden md:flex flex-col gap-2 p-4 bg-background rounded-lg border relative self-start">
                    {navItems.map((item, index) => {
                        if (item.type === 'divider') {
                            return <Separator key={`divider-${index}`} className="my-2" />;
                        }
                        const Icon = item.icon;
                        if (!Icon) return null;

                        if (item.subItems) {
                            return (
                                <Accordion key={item.id} type="single" collapsible defaultValue='organization' className="w-full">
                                    <AccordionItem value="organization" className="border-b-0">
                                        <AccordionTrigger
                                            onClick={() => setActiveTab(item.id)}
                                            className={cn(
                                                "justify-start p-3 hover:no-underline w-full rounded-lg font-semibold text-base h-auto",
                                                "transition-colors duration-200",
                                                activeTab === item.id 
                                                    ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                                                    : 'hover:bg-accent hover:text-accent-foreground'
                                            )}
                                        >
                                            <Icon className="mr-3 h-5 w-5" />
                                            {item.label}
                                        </AccordionTrigger>
                                        <AccordionContent className="pl-4 pt-1">
                                            <div className="flex flex-col gap-1">
                                                {item.subItems.map(sub => (
                                                    <Button
                                                        key={sub.id}
                                                        variant={'ghost'}
                                                        className={cn(
                                                            "justify-start",
                                                            activeSubTab === sub.id && activeTab === 'organization' 
                                                                ? 'bg-accent text-accent-foreground' 
                                                                : 'hover:bg-accent hover:text-accent-foreground'
                                                        )}
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
                                variant="ghost"
                                className={cn(
                                    "justify-start p-3 font-semibold text-base h-auto",
                                    "transition-colors duration-200",
                                    activeTab === item.id 
                                        ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                                        : 'hover:bg-accent hover:text-accent-foreground'
                                )}
                                onClick={() => setActiveTab(item.id)}
                            >
                                <Icon className={cn("mr-3 h-5 w-5")} />
                                {item.label}
                            </Button>
                        )
                    })}
                </nav>

                <div className="md:col-span-1 rounded-lg">
                    {renderContent()}
                </div>
            </div>
        </main>
    );
}

    