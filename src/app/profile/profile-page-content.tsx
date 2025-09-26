
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Camera } from 'lucide-react';

export function ProfilePageContent() {
  const userAvatar = PlaceHolderImages.find((img) => img.id === 'patrick-achitabwino-m1');

  return (
    <main className="flex-grow p-4 md:p-8">
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Profile Picture and Details */}
        <div className="lg:col-span-1 space-y-8">
          <Card>
            <CardHeader className="items-center">
                <div className="relative">
                    <Avatar className="h-32 w-32">
                        <AvatarImage src={userAvatar?.imageUrl} alt="User" data-ai-hint={userAvatar?.imageHint} />
                        <AvatarFallback className="text-4xl">PA</AvatarFallback>
                    </Avatar>
                    <Button variant="outline" size="icon" className="absolute bottom-2 right-2 rounded-full bg-background/80 h-10 w-10">
                        <Camera className="h-5 w-5" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="text-center">
              <CardTitle className="text-2xl">Patrick Achitabwino</CardTitle>
              <CardDescription>Consultant</CardDescription>
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
                    <Input id="email" defaultValue="patrick.achitabwino@example.com" disabled />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" placeholder="+1 (555) 123-4567" />
                </div>
            </CardContent>
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
                        <Input id="fullName" defaultValue="Patrick Achitabwino" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <Input id="department" defaultValue="Customer Service" />
                    </div>
               </div>
                <div className="space-y-2">
                    <Label htmlFor="job-description">Job Description</Label>
                    <Textarea
                    id="job-description"
                    placeholder="Describe your role and responsibilities..."
                    className="h-24"
                    defaultValue="As a Customer Service Consultant, I assist clients with their inquiries, provide support for our products, and ensure a high level of customer satisfaction."
                    />
                </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Key Performance Indicators (KPIs)</CardTitle>
              <CardDescription>
                Define your primary goals and targets.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="kpi1">Primary KPI</Label>
                <Input id="kpi1" placeholder="e.g., Achieve a 95% customer satisfaction score" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kpi2">Secondary KPI</Label>
                <Input id="kpi2" placeholder="e.g., Reduce average response time to under 2 hours" />
              </div>
               <div className="space-y-2">
                <Label htmlFor="kpi3">Tertiary KPI</Label>
                <Input id="kpi3" placeholder="e.g., Upsell services to 10% of existing clients" />
              </div>
            </CardContent>
          </Card>
           <div className="flex justify-end">
            <Button>Save Changes</Button>
          </div>
        </div>
      </div>
    </main>
  );
}
