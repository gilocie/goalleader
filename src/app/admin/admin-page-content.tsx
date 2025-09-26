
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Shield, Palette, KeyRound, Building, Users, Ban, Trash2, MessageSquare, UserCheck, Search } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { allUsers } from '@/lib/users';
import { Badge } from '@/components/ui/badge';


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

function ApiConfigTabContent() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>API Configuration</CardTitle>
                <CardDescription>Manage third-party API keys and service integrations.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 max-w-2xl">
                <div className='space-y-2'>
                    <Label htmlFor='gemini-key'>Google Gemini API Key</Label>
                    <Input id="gemini-key" type="password" placeholder="Enter your Gemini API Key" />
                </div>
                 <Button>Save API Keys</Button>
            </CardContent>
        </Card>
    );
}

function UserManagementTabContent() {
    const users = allUsers.map(u => ({
        ...u,
        email: `${u.label.toLowerCase().replace(/\s/g, '.')}@goalleader.com`,
        department: 'Customer Service',
        role: u.label.includes('Patrick') ? 'Admin' : 'Consultant'
    }));

    return (
         <Card>
            <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>View, manage, and assign roles to all users in the system.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="mb-4 relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search by name or email..." className="w-full pl-8" />
                </div>
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
                            return (
                                <TableRow key={user.value}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className='h-9 w-9'>
                                                <AvatarImage src={avatar?.imageUrl} alt={user.label} />
                                                <AvatarFallback>{user.label.slice(0, 2)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{user.label}</p>
                                                <p className="text-xs text-muted-foreground">{user.email}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{user.department}</TableCell>
                                    <TableCell>
                                        <Badge variant={user.role === 'Admin' ? 'default' : 'secondary'}>{user.role}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon"><MessageSquare className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon"><UserCheck className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" className="text-destructive"><Ban className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
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


export function AdminPageContent() {
    return (
        <main className="flex-grow p-4 md:p-8">
            <div className='flex items-center gap-3 mb-6'>
                <Shield className='h-8 w-8 text-primary' />
                <div>
                    <h1 className="text-2xl font-bold">Admin Control Panel</h1>
                    <p className="text-muted-foreground">System-wide configuration and management.</p>
                </div>
            </div>
            <Tabs defaultValue="branding">
                <TabsList className="grid w-full max-w-lg grid-cols-3 mb-8">
                    <TabsTrigger value="branding"><Palette className="mr-2 h-4 w-4" />Branding</TabsTrigger>
                    <TabsTrigger value="api"><KeyRound className="mr-2 h-4 w-4" />API Keys</TabsTrigger>
                    <TabsTrigger value="organization"><Building className="mr-2 h-4 w-4" />Organization</TabsTrigger>
                </TabsList>
                <TabsContent value="branding">
                   <BrandingTabContent />
                </TabsContent>
                 <TabsContent value="api">
                   <ApiConfigTabContent />
                </TabsContent>
                 <TabsContent value="organization">
                    <Tabs defaultValue="users" className="w-full">
                        <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
                            <TabsTrigger value="users"><Users className="mr-2 h-4 w-4"/>User Management</TabsTrigger>
                            <TabsTrigger value="departments"><Building className="mr-2 h-4 w-4"/>Departments</TabsTrigger>
                        </TabsList>
                        <TabsContent value="users">
                            <UserManagementTabContent />
                        </TabsContent>
                        <TabsContent value="departments">
                            <DepartmentsTabContent />
                        </TabsContent>
                    </Tabs>
                 </TabsContent>
            </Tabs>
        </main>
    );
}

