
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Camera, PlusCircle, Trash2, LifeBuoy, Users } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/context/theme-provider';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUser } from '@/context/user-context';
import { useUser as useFirebaseAuthUser } from '@/firebase';
import type { UserRole } from '@/context/user-context';
import { Skeleton } from '@/components/ui/skeleton';
import type { TeamMember } from '@/lib/users';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

type Kpi = {
  id: number;
  value: string;
};

const departmentsAndRoles = {
    "Customer Service": ["Consultant", "Team Leader"],
    "Engineering": ["Frontend Developer", "Backend Developer", "QA Engineer", "Team Leader"],
    "Marketing": ["Marketing Specialist", "Content Creator", "Team Leader"],
    "ICT": ["Admin", "IT Support", "Team Leader"],
};

const departments = Object.keys(departmentsAndRoles);
const countries = ["Malawi", "United States", "United Kingdom", "Canada"];
const branches = ["Main Office", "Lilongwe Branch", "Blantyre Branch"];


function ProfileTabContent() {
    const { user, saveUser, loading, allTeamMembers } = useUser();
    const { user: firebaseUser } = useFirebaseAuthUser();
    
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [selectedCountry, setSelectedCountry] = useState('');
    const [selectedBranch, setSelectedBranch] = useState('');

    const [kpis, setKpis] = useState<Kpi[]>([
        { id: 1, value: '' },
        { id: 2, value: '' },
        { id: 3, value: '' },
    ]);
    
    const adminCount = useMemo(() => allTeamMembers.filter(u => u.role === 'Admin').length, [allTeamMembers]);
    const isSoleAdmin = useMemo(() => user?.role === 'Admin' && adminCount === 1, [user, adminCount]);

    useEffect(() => {
        if (user && firebaseUser) {
            setName(user.name);
            setSelectedDepartment(user.department);
            setSelectedRole(user.role);
            setSelectedCountry(user.country || '');
            setSelectedBranch(user.branch || '');
            setEmail(firebaseUser.email || '');
        }
    }, [user, firebaseUser]);

    if (loading || !user) {
        return (
            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-1 space-y-8">
                    <Card>
                        <CardHeader className="items-center">
                           <Skeleton className="h-32 w-32 rounded-full" />
                        </CardHeader>
                        <CardContent className="text-center space-y-2">
                            <Skeleton className="h-8 w-40 mx-auto" />
                            <Skeleton className="h-6 w-24 mx-auto" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-4 w-48" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2 space-y-8">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-40" />
                            <Skeleton className="h-4 w-64" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                           <Skeleton className="h-10 w-full" />
                           <Skeleton className="h-10 w-full" />
                           <Skeleton className="h-10 w-full" />
                           <Skeleton className="h-24 w-full" />
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-4 w-56" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                           <Skeleton className="h-10 w-full" />
                           <Skeleton className="h-10 w-full" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    const userAvatar = PlaceHolderImages.find((img) => img.id === user.id);
    const availableRoles = departmentsAndRoles[selectedDepartment as keyof typeof departmentsAndRoles] || [];

    const handleDepartmentChange = (department: string) => {
        setSelectedDepartment(department);
        const rolesForDept = departmentsAndRoles[department as keyof typeof departmentsAndRoles];
        setSelectedRole(rolesForDept ? rolesForDept[0] : '');
    };

    const handleSaveChanges = () => {
        saveUser({
            ...user,
            name,
            role: selectedRole as UserRole,
            department: selectedDepartment,
            country: selectedCountry,
            branch: selectedBranch,
        });
    };

    const addKpi = () => {
        setKpis([...kpis, { id: Date.now(), value: '' }]);
    };

    const removeKpi = (id: number) => {
        setKpis(kpis.filter((kpi) => kpi.id !== id));
    };

    const handleKpiChange = (id: number, value: string) => {
        setKpis(kpis.map((kpi) => (kpi.id === id ? { ...kpi, value } : kpi)));
    };

    const getKpiLabel = (index: number) => {
        if (index === 0) return 'Primary KPI';
        if (index === 1) return 'Secondary KPI';
        if (index === 2) return 'Tertiary KPI';
        return `KPI #${index + 1}`;
    }

    return (
        <>
        <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Profile Picture and Details */}
        <div className="lg:col-span-1 space-y-8">
          <Card>
            <CardHeader className="items-center">
                <div className="relative">
                    <Avatar className="h-32 w-32">
                        <AvatarImage src={userAvatar?.imageUrl} alt={user.name} data-ai-hint={userAvatar?.imageHint} className="object-cover object-top" />
                        <AvatarFallback className="text-4xl">{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <Button variant="outline" size="icon" className="absolute bottom-2 right-2 rounded-full bg-background/80 h-10 w-10">
                        <Camera className="h-5 w-5" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="text-center">
                <div className='flex items-center justify-center gap-2'>
                    <CardTitle className="text-2xl">{name}</CardTitle>
                </div>
            </CardContent>
          </Card>

           <Card>
            <CardHeader>
                <CardTitle>Contact Details</CardTitle>
                <CardDescription>Your contact information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={email} disabled />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" placeholder="+265 99 123 4567" />
                </div>
            </CardContent>
          </Card>
          
           <Card>
                <CardHeader>
                    <CardTitle>Account Actions</CardTitle>
                </CardHeader>
                <CardFooter>
                     <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="w-full">
                                    <Button variant="destructive" className="w-full" disabled={isSoleAdmin}>
                                        <Trash2 className='mr-2 h-4 w-4' />
                                        Delete Account
                                    </Button>
                                </div>
                            </TooltipTrigger>
                            {isSoleAdmin && (
                                <TooltipContent>
                                    <p>You cannot delete your account as the sole administrator.</p>
                                </TooltipContent>
                            )}
                        </Tooltip>
                    </TooltipProvider>
                </CardFooter>
            </Card>

        </div>

        {/* Right Column: Forms */}
        <div className="lg:col-span-2 space-y-8">
           <Card>
            <CardHeader>
              <CardTitle>Professional Details</CardTitle>
              <CardDescription>
                Information about your role and department.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input id="fullName" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <Select value={selectedDepartment} onValueChange={handleDepartmentChange}>
                          <SelectTrigger id="department">
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            {departments.map((dept) => (
                              <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                    </div>
               </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select value={selectedRole} onValueChange={setSelectedRole} disabled={isSoleAdmin}>
                          <SelectTrigger id="role">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableRoles.map((role) => (
                              <SelectItem key={role} value={role}>{role}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                            <SelectTrigger id="country">
                                <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent>
                                {countries.map((country) => (
                                    <SelectItem key={country} value={country}>{country}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="branch">Branch</Label>
                        <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                            <SelectTrigger id="branch">
                                <SelectValue placeholder="Select branch" />
                            </SelectTrigger>
                            <SelectContent>
                                {branches.map((branch) => (
                                    <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="job-description">Job Description</Label>
                    <Textarea
                    id="job-description"
                    placeholder="Describe your role and responsibilities..."
                    className="h-24"
                    />
                </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Key Performance Indicators (KPIs)</CardTitle>
              <CardDescription>Define your primary goals and targets.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {kpis.map((kpi, index) => (
                <div key={kpi.id} className="space-y-2">
                  <Label htmlFor={`kpi-${kpi.id}`}>{getKpiLabel(index)}</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id={`kpi-${kpi.id}`}
                      value={kpi.value}
                      onChange={(e) => handleKpiChange(kpi.id, e.target.value)}
                      placeholder={`Define a KPI...`}
                    />
                    {kpis.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeKpi(kpi.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addKpi}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add KPI
              </Button>
            </CardContent>
          </Card>
           <div className="flex justify-end">
            <Button onClick={handleSaveChanges}>Save Changes</Button>
          </div>
        </div>
      </div>
      </>
    );
}


function SettingsTabContent() {
    const { theme, setTheme } = useTheme();

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
             <Card>
                <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>Customize the look and feel of the application.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <Label htmlFor="theme-switch">
                            <span className="font-semibold">Theme</span>
                            <p className="text-sm text-muted-foreground">Switch between light and dark mode.</p>
                        </Label>
                        <div className="flex items-center gap-4">
                            <span>Light</span>
                            <Switch
                                id="theme-switch"
                                checked={theme === 'dark'}
                                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                            />
                            <span>Dark</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>Update your account password.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input id="current-password" type="password" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input id="new-password" type="password" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input id="confirm-password" type="password" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>Manage how you receive notifications.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex items-center justify-between">
                        <Label htmlFor="email-notifications">
                            <span className="font-semibold">Email Notifications</span>
                            <p className="text-sm text-muted-foreground">Receive updates and alerts in your inbox.</p>
                        </Label>
                        <Switch id="email-notifications" />
                    </div>
                    <div className="flex items-center justify-between">
                        <Label htmlFor="push-notifications">
                             <span className="font-semibold">Push Notifications</span>
                            <p className="text-sm text-muted-foreground">Get notified directly on your device.</p>
                        </Label>
                        <Switch id="push-notifications" defaultChecked />
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button>Save Settings</Button>
            </div>
        </div>
    )
}

function SupportTabContent() {
    const faqs = [
        {
          question: "How do I reset my password?",
          answer: "You can reset your password by going to the 'Settings' tab on your profile page. You will find a 'Change Password' section there."
        },
        {
          question: "Where can I see my performance metrics?",
          answer: "The 'Performance' page provides a detailed overview of your completed projects and AI-driven feedback. The 'Analytics' page offers a higher-level view of team and project trends."
        },
        {
          question: "How does the AI task suggestion work?",
          answer: "When you open the 'Add New Task' dialog, you can click 'Use GoalLeader' to get AI-powered task suggestions based on your role and existing schedule. It helps you fill your open time slots with relevant work."
        },
        {
            question: "Can I edit a task once it's created?",
            answer: "Yes, you can edit a task from the 'Tasks' page. Click the three-dots menu on any task row and select 'Edit' to make changes."
        }
      ];

    return (
        <div className="grid gap-8 md:grid-cols-2 max-w-6xl mx-auto">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-primary/10 rounded-full">
                           <LifeBuoy className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-3xl">Support Center</CardTitle>
                    </div>
                    <CardDescription>Have an issue or a question? Fill out the form below and our team will get back to you.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="support-subject">Subject</Label>
                            <Input id="support-subject" placeholder="e.g., Issue with task timer" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="support-description">Description</Label>
                            <Textarea id="support-description" placeholder="Please describe your problem in detail..." className="h-32" />
                        </div>
                        <Button className="w-full">Submit Ticket</Button>
                    </form>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                    <CardDescription>Find answers to common questions below.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        {faqs.map((faq, index) => (
                             <AccordionItem key={index} value={`item-${index}`}>
                                <AccordionTrigger>{faq.question}</AccordionTrigger>
                                <AccordionContent>
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>
        </div>
    );
}

export function ProfilePageContent() {
  return (
    <main className="flex-grow p-4 md:p-8">
        <Tabs defaultValue="profile">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
                <TabsTrigger value="support">Support</TabsTrigger>
            </TabsList>
            <TabsContent value="profile">
                <ProfileTabContent />
            </TabsContent>
            <TabsContent value="settings">
                <SettingsTabContent />
            </TabsContent>
            <TabsContent value="support">
                <SupportTabContent />
            </TabsContent>
        </Tabs>
    </main>
  );
}

    