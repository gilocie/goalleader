
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Loader2, GitBranch, Briefcase, Copy, AlertTriangle, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';

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
  
  const ConnectFirebaseStep = () => {
      const [isSignedIn, setIsSignedIn] = useState(false);
      const [selectedProject, setSelectedProject] = useState<string | null>(null);

      return (
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
  }

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
  
const DomainSetupStep = () => {
    const [domain, setDomain] = useState('');
    const [subdomain, setSubdomain] = useState('');
    const [showInstructions, setShowInstructions] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [verificationAttempted, setVerificationAttempted] = useState(false);
    const { toast } = useToast();

    const handleDomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const fullDomain = e.target.value;
        setDomain(fullDomain);
        setIsVerified(false);
        setVerificationAttempted(false);

        try {
            const url = new URL(`http://${fullDomain}`);
            const parts = url.hostname.split('.');
            if (parts.length > 2) {
                setSubdomain(parts[0]);
            } else {
                setSubdomain('@'); // Or 'www' if you prefer
            }
        } catch (error) {
            setSubdomain('');
        }
        setShowInstructions(fullDomain.length > 0);
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: "Copied to clipboard!" });
    };

    const handleVerify = () => {
        setIsVerifying(true);
        setVerificationAttempted(true);
        setTimeout(() => {
            // Simulate a 50/50 chance of success for demo purposes
            const success = Math.random() > 0.5;
            setIsVerified(success);
            setIsVerifying(false);
        }, 2000);
    };

    return (
        <div className="w-full max-w-lg space-y-6">
            <div className="space-y-2">
                <Label htmlFor='domain-name'>Enter your preferred subdomain</Label>
                <Input
                    id="domain-name"
                    placeholder="e.g., goalleader.nico.mw"
                    value={domain}
                    onChange={handleDomainChange}
                />
            </div>

            {showInstructions && (
                <Card>
                    <CardHeader>
                        <CardTitle>Step 1: Add CNAME Record to Your DNS</CardTitle>
                        <CardDescription>Log in to your domain provider (e.g., Cloudflare, GoDaddy) and create a CNAME record with these details.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="font-medium">Type</TableCell>
                                    <TableCell>CNAME</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">Name / Host</TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-between">
                                            <span className='font-mono'>{subdomain || '[subdomain]'}</span>
                                            <Button variant="ghost" size="icon" onClick={() => handleCopy(subdomain)}><Copy className="h-4 w-4" /></Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">Points to / Value</TableCell>
                                    <TableCell>
                                         <div className="flex items-center justify-between">
                                            <span className='font-mono'>ghs.googlehosted.com</span>
                                            <Button variant="ghost" size="icon" onClick={() => handleCopy('ghs.googlehosted.com')}><Copy className="h-4 w-4" /></Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">TTL</TableCell>
                                    <TableCell>Default</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {showInstructions && (
                 <Card>
                    <CardHeader>
                        <CardTitle>Step 2: Verify Domain</CardTitle>
                        <CardDescription>After adding the CNAME record, click below to verify. It may take a few minutes for DNS changes to apply.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button onClick={handleVerify} disabled={isVerifying} className="w-full">
                            {isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Verify Domain
                        </Button>
                        {verificationAttempted && !isVerifying && (
                            isVerified ? (
                                <div className="p-3 rounded-md bg-green-50 border border-green-200 text-green-800 text-sm flex items-center gap-2">
                                    <Check className="h-4 w-4" />
                                    Domain verified successfully!
                                </div>
                            ) : (
                                 <div className="p-3 rounded-md bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4" />
                                    Domain not verified yet. Try again in a few minutes.
                                </div>
                            )
                        )}
                    </CardContent>
                </Card>
            )}

             {isVerified && (
                <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-4 text-center">
                        <p className="text-sm">Your company site will soon be live at: <br />
                        <a href={`https://${domain}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary underline flex items-center justify-center gap-1">
                            {`https://${domain}`} <ExternalLink className='h-4 w-4' />
                        </a>
                        </p>
                    </CardContent>
                </Card>
             )}
        </div>
    );
};

  const renderStepContent = () => {
    switch(currentStep) {
        case 0:
            return <WelcomeStep />
        case 1:
            return <ConnectFirebaseStep />
        case 2:
            return <CompanyDetailsStep />
        case 3:
            return <DomainSetupStep />
        case 4:
            return <div>Finalizing your setup.</div>
        default:
            return null;
    }
  }

  const isNextDisabled = () => {
    if (isLoading) return true;
    // Disable 'Next' on Firebase step until a project is selected
    // Note: this is a simplistic check. In a real app, you'd lift state up.
    if (currentStep === 1) {
        // This is tricky without state lifting, will skip for now in simulation
    }
    // Disable 'Next' on Domain step until verified
    // This is also tricky without state lifting.
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

    