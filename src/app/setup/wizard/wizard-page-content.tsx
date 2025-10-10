
'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Loader2, GitBranch, Briefcase, Copy, AlertTriangle, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  const router = useRouter();

  const backgroundImages = useMemo(() => ({
    0: PlaceHolderImages.find(p => p.id === 'wizard-step-1'),
    1: PlaceHolderImages.find(p => p.id === 'wizard-step-2'),
    2: PlaceHolderImages.find(p => p.id === 'wizard-step-3'),
    3: PlaceHolderImages.find(p => p.id === 'wizard-step-4'),
    4: PlaceHolderImages.find(p => p.id === 'wizard-step-5'),
  }), []);

  const currentBg = backgroundImages[0];


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

      const GoogleLogo = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
            <path fill="#FF3D00" d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z" />
            <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
            <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-0.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.012 36.49 44 30.861 44 24c0-1.341-.138-2.65-.389-3.917z" />
        </svg>
      );

      return (
        <div className="w-full max-w-lg text-center">
            {!isSignedIn ? (
                <div className="flex flex-col items-center gap-4">
                    <GoogleLogo />
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
                    <CardHeader className="p-4">
                        <CardTitle className="text-base">Step 1: Add CNAME Record to Your DNS</CardTitle>
                        <CardDescription className="text-xs">Log in to your domain provider and create a CNAME record with these details.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <Table>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="font-medium text-xs">Type</TableCell>
                                    <TableCell className="text-xs">CNAME</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium text-xs">Name / Host</TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-between">
                                            <span className='font-mono text-xs'>{subdomain || '[subdomain]'}</span>
                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopy(subdomain)}><Copy className="h-3 w-3" /></Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium text-xs">Points to</TableCell>
                                    <TableCell>
                                         <div className="flex items-center justify-between">
                                            <span className='font-mono text-xs'>ghs.googlehosted.com</span>
                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopy('ghs.googlehosted.com')}><Copy className="h-3 w-3" /></Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {showInstructions && (
                 <Card>
                    <CardHeader className="p-4">
                        <CardTitle className="text-base">Step 2: Verify Domain</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 p-4 pt-0">
                        <Button onClick={handleVerify} disabled={isVerifying} className="w-full">
                            {isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Verify Domain
                        </Button>
                        {verificationAttempted && !isVerifying && (
                            isVerified ? (
                                <div className="p-2 rounded-md bg-green-50 border border-green-200 text-green-800 text-xs flex items-center gap-2">
                                    <Check className="h-3 w-3" />
                                    Domain verified successfully!
                                </div>
                            ) : (
                                 <div className="p-2 rounded-md bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs flex items-center gap-2">
                                    <AlertTriangle className="h-3 w-3" />
                                    Domain not verified yet. Try again in a few minutes.
                                </div>
                            )
                        )}
                    </CardContent>
                </Card>
             )}

             {isVerified && (
                <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-3 text-center">
                        <p className="text-xs">Your company site will soon be live at: <br />
                        <a href={`https://${domain}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary underline flex items-center justify-center gap-1">
                            {`https://${domain}`} <ExternalLink className='h-3 w-3' />
                        </a>
                        </p>
                    </CardContent>
                </Card>
             )}
        </div>
    );
};

  const FinalizingStep = ({ onFinish }: { onFinish: () => void }) => {
    const [isFinalizing, setIsFinalizing] = useState(false);
    const [isComplete, setIsComplete] = useState(false);

    const handleFinishClick = () => {
        setIsFinalizing(true);
        setTimeout(() => {
            setIsFinalizing(false);
            setIsComplete(true);
            setTimeout(() => {
                onFinish();
            }, 1500);
        }, 3000);
    };

    if (isFinalizing || isComplete) {
        return (
            <div className="text-center space-y-6">
                {isComplete ? (
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center animate-in zoom-in-50">
                            <Check className="h-12 w-12 text-green-600" />
                        </div>
                        <p className="text-lg font-semibold">Setup Complete!</p>
                        <p className="text-muted-foreground">Redirecting you now...</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <p className="text-lg font-semibold">Building your environment...</p>
                        <p className="text-muted-foreground">This may take a moment.</p>
                    </div>
                )}
            </div>
        );
    }
    
    return (
        <div className="flex flex-col items-center gap-4 text-center">
           <h2 className="text-2xl font-semibold">You're All Set!</h2>
           <p className="text-muted-foreground max-w-sm mx-auto">
               Click the button below to finalize the setup and build your environment. You will be redirected to the main page upon completion.
           </p>
           <Button onClick={handleFinishClick} size="lg">Finish Setup</Button>
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
            return <FinalizingStep onFinish={() => router.push('/')} />;
        default:
            return null;
    }
  }

  const isNextDisabled = () => {
    if (isLoading) return true;
    return false;
  }
  
  const isFinalStep = currentStep === STEPS.length - 1;

  return (
    <main className="relative h-screen w-screen flex items-center justify-center bg-muted overflow-hidden">
        {currentBg && (
            <Image
                src={currentBg.imageUrl}
                alt={currentBg.description}
                data-ai-hint={currentBg.imageHint}
                fill
                className="object-cover z-0"
            />
        )}
        <div className="absolute inset-0 bg-black/50 z-0" />
      <Card className="w-full max-w-4xl h-auto max-h-[600px] z-10 bg-card/80 backdrop-blur-md flex flex-col">
        <CardContent className="flex-1 flex items-center justify-center py-6 overflow-hidden">
            <ScrollArea className="h-full w-full">
              <div className="flex flex-col items-center justify-center p-4 min-h-[380px]">
                  <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold tracking-tight">{STEPS[currentStep]}</h1>
                    <p className="text-muted-foreground">Step {currentStep + 1} of {STEPS.length}</p>
                  </div>
                  {renderStepContent()}
              </div>
            </ScrollArea>
        </CardContent>
        { !isFinalStep ? (
             <div className="p-6 border-t flex justify-between items-center">
                <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 0 || isLoading}>
                    Previous
                </Button>

                <ul className="flex items-center gap-2 md:gap-4">
                  {STEPS.map((step, index) => (
                    <li key={step} className="flex items-center gap-2">
                      <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                        currentStep > index ? "bg-primary text-primary-foreground" : "bg-muted-foreground/20 text-muted-foreground",
                        currentStep === index && "bg-primary text-primary-foreground ring-4 ring-primary/20"
                      )}>
                        {currentStep > index ? <Check className="h-5 w-5" /> : index + 1}
                      </div>
                      <span className={cn(
                        "hidden md:block text-sm transition-colors",
                         currentStep >= index ? "font-semibold text-foreground" : "text-muted-foreground"
                      )}>{step}</span>
                    </li>
                  ))}
                </ul>

                <Button onClick={handleNext} disabled={isNextDisabled()}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Next
                </Button>
            </div>
        ) : (
            <div className="p-6 border-t flex justify-center">
                {renderStepContent()}
            </div>
        )}
      </Card>
    </main>
  );
}
