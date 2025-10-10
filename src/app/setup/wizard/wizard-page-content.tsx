
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Loader2, GitBranch, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Dummy data for simulation
const STEPS = [
  "Welcome",
  "Connect Firebase",
  "Company Details",
  "Domain Setup",
  "Finalizing",
];

const mockProjects = [
    { id: 'goalleader-prod-3a4b1c', name: 'GoalLeader Production' },
    { id: 'acme-corp-web-9f8e7d', name: 'Acme Corp Website' },
    { id: 'internal-crm-5c6b2a', name: 'Internal CRM' },
]

export function WizardPageContent() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const handleNext = () => {
    setIsLoading(true);
    setTimeout(() => {
      if (currentStep < STEPS.length - 1) {
        setCurrentStep(currentStep + 1);
      }
      setIsLoading(false);
    }, 1000);
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const WelcomeStep = () => (
    <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Welcome to the GoalLeader Setup Wizard</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
            This wizard will guide you through connecting your Firebase project, setting up your company details, and configuring your domain. Let's get started!
        </p>
    </div>
  );
  
  const ConnectFirebaseStep = () => (
    <div className="w-full max-w-lg text-center">
        {!isSignedIn ? (
            <div className="flex flex-col items-center gap-4">
                 <Image src="/google.svg" alt="Google logo" width={48} height={48} />
                 <h3 className="text-xl font-semibold">Connect Your Firebase Account</h3>
                 <p className="text-muted-foreground">
                    Sign in with your Google account to select the Firebase project you want to use for GoalLeader.
                </p>
                <Button onClick={() => { setIsLoading(true); setTimeout(() => { setIsSignedIn(true); setIsLoading(false); }, 1500)}}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign in with Google
                </Button>
            </div>
        ) : (
             <div className="space-y-4 text-left">
                <h3 className="text-xl font-semibold text-center">Select Your Firebase Project</h3>
                <div className="space-y-3">
                    {mockProjects.map((project) => (
                        <Card 
                            key={project.id} 
                            className={cn(
                                "p-4 cursor-pointer hover:bg-muted/50 transition-colors border-2",
                                selectedProject === project.id ? "border-primary bg-primary/5" : ""
                            )}
                            onClick={() => setSelectedProject(project.id)}
                        >
                           <div className="flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                 <div className="p-3 bg-primary/10 rounded-full">
                                    <GitBranch className="h-5 w-5 text-primary" />
                                 </div>
                                 <div>
                                    <p className="font-semibold">{project.name}</p>
                                    <p className="text-xs text-muted-foreground font-mono">ID: {project.id}</p>
                                 </div>
                             </div>
                              {selectedProject === project.id && <Check className="h-6 w-6 text-primary" />}
                           </div>
                        </Card>
                    ))}
                </div>
                 <p className="text-sm text-center text-muted-foreground pt-2">
                    Don't see your project? <a href="#" className="text-primary underline">Create a new one in Firebase.</a>
                </p>
            </div>
        )}
    </div>
  );

  const CompanyDetailsStep = () => (
    <div className="w-full max-w-lg space-y-6">
        <div className="space-y-2">
            <Label htmlFor='company-name'>Company Name</Label>
            <Input id="company-name" placeholder="e.g., Acme Corporation" />
        </div>
        <div className="space-y-2">
            <Label htmlFor='admin-email'>Administrator Email</Label>
            <Input id="admin-email" type="email" placeholder="e.g., admin@acme.com" />
        </div>
        <Card className="p-4 bg-secondary/50">
            <h4 className="font-semibold mb-3">Branding</h4>
            <div className="grid grid-cols-3 gap-4">
                 <div className="space-y-2">
                    <Label>Primary Color</Label>
                    <Input type="color" defaultValue="#27AE60" className="p-1 h-10" />
                </div>
                 <div className="space-y-2">
                    <Label>Background</Label>
                    <Input type="color" defaultValue="#F7FAFC" className="p-1 h-10" />
                </div>
                 <div className="space-y-2">
                    <Label>Accent</Label>
                    <Input type="color" defaultValue="#90EE90" className="p-1 h-10" />
                </div>
            </div>
        </Card>
    </div>
  );
  
  const renderStepContent = () => {
    switch(currentStep) {
        case 0:
            return <WelcomeStep />
        case 1:
            return <ConnectFirebaseStep />
        case 2:
            return <CompanyDetailsStep />
        case 3:
            return <div>Setup your custom domain.</div>
        case 4:
            return <div>Finalizing your setup.</div>
        default:
            return null;
    }
  }

  const isNextDisabled = () => {
    if (isLoading) return true;
    if (currentStep === 1 && (!isSignedIn || !selectedProject)) return true;
    return false;
  }

  return (
    <main className="flex-grow p-4 md:p-8 flex items-center justify-center bg-muted">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <ul className="flex items-center gap-2 md:gap-4">
              {STEPS.map((step, index) => (
                <li key={step} className="flex items-center gap-2">
                  <div className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                    currentStep > index ? "bg-primary text-primary-foreground" : "bg-muted-foreground text-muted",
                    currentStep === index && "bg-primary text-primary-foreground ring-4 ring-primary/20"
                  )}>
                    {currentStep > index ? <Check className="h-5 w-5" /> : index + 1}
                  </div>
                  <span className={cn(
                    "hidden md:block text-sm transition-colors",
                     currentStep >= index ? "font-semibold text-primary" : "text-muted-foreground"
                  )}>{step}</span>
                </li>
              ))}
            </ul>
          </div>
          <CardTitle className="text-center text-2xl">{STEPS[currentStep]}</CardTitle>
          <CardDescription className="text-center">
            Step {currentStep + 1} of {STEPS.length}
          </CardDescription>
        </CardHeader>
        <CardContent className="min-h-[300px] flex items-center justify-center">
            {renderStepContent()}
        </CardContent>
        <div className="p-6 border-t flex justify-between">
            <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 0 || isLoading}>
                Previous
            </Button>
            <Button onClick={handleNext} disabled={isNextDisabled()}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {currentStep === STEPS.length - 1 ? 'Finish' : 'Next'}
            </Button>
        </div>
      </Card>
    </main>
  );
}
