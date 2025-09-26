
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Camera, PlusCircle, Trash2 } from 'lucide-react';

type Kpi = {
  id: number;
  value: string;
};

export function ProfilePageContent() {
  const userAvatar = PlaceHolderImages.find((img) => img.id === 'patrick-achitabwino-m1');
  const [kpis, setKpis] = useState<Kpi[]>([
    { id: 1, value: '' },
    { id: 2, value: '' },
    { id: 3, value: '' },
  ]);

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
    <main className="flex-grow p-4 md:p-8">
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Profile Picture and Details */}
        <div className="lg:col-span-1 space-y-8">
          <Card>
            <CardHeader className="items-center">
                <div className="relative">
                    <Avatar className="h-32 w-32">
                        <AvatarImage src={userAvatar?.imageUrl} alt="User" data-ai-hint={userAvatar?.imageHint} className="object-cover object-top" />
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
                    <Input id="email" defaultValue="patrick@goalleader.com" disabled />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" placeholder="+265 99 123 4567" />
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
                      placeholder={`e.g., ${
                        index === 0
                          ? 'Achieve a 95% customer satisfaction score'
                          : index === 1
                          ? 'Reduce average response time to under 2 hours'
                          : 'Define a new KPI...'
                      }`}
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
            <Button>Save Changes</Button>
          </div>
        </div>
      </div>
    </main>
  );
}
