
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Shield, Palette, KeyRound, Building } from 'lucide-react';

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

function OrganizationTabContent() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Organization</CardTitle>
                <CardDescription>Manage departments and assign roles to team leaders.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 max-w-2xl">
                 <div className='space-y-4'>
                    <h3 className='font-medium'>Departments</h3>
                    <div className='space-y-2'>
                        <Label>Add New Department</Label>
                        <div className='flex gap-2'>
                            <Input placeholder="e.g., Human Resources" />
                            <Button>Add Department</Button>
                        </div>
                    </div>
                    <p className='text-muted-foreground text-sm'>Existing: Customer Service, Engineering, Marketing</p>
                 </div>
                 <div className='space-y-4'>
                    <h3 className='font-medium'>Roles</h3>
                     <div className='space-y-2'>
                        <Label>Assign Team Leader</Label>
                        <div className='flex gap-2'>
                            <Input placeholder="Team leader's email" />
                            <Button>Assign Role</Button>
                        </div>
                    </div>
                 </div>
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
                <TabsList className="grid w-full max-w-md grid-cols-3 mb-8">
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
                   <OrganizationTabContent />
                </TabsContent>
            </Tabs>
        </main>
    );
}
