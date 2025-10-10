
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Dummy data for simulation
const STEPS = [
  "Welcome",
  "Connect Firebase",
  "Company Details",
  "Domain Setup",
  "Finalizing",
];

export function SetupPageContent() {
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
  
  const renderStepContent = () => {
    switch(currentStep) {
        case 0:
            return <div>Welcome to the setup wizard!</div>
        case 1:
            return <div>Connect your Firebase project here.</div>
        case 2:
            return <div>Enter your company details.</div>
        case 3:
            return <div>Setup your custom domain.</div>
        case 4:
            return <div>Finalizing your setup.</div>
        default:
            return null;
    }
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
                    "h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold",
                    currentStep > index ? "bg-primary text-primary-foreground" : "bg-muted-foreground text-muted",
                    currentStep === index && "bg-primary text-primary-foreground ring-4 ring-primary/20"
                  )}>
                    {currentStep > index ? <Check className="h-5 w-5" /> : index + 1}
                  </div>
                  <span className={cn(
                    "hidden md:block text-sm",
                     currentStep >= index ? "font-semibold" : "text-muted-foreground"
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
        <CardContent className="min-h-[250px] flex items-center justify-center">
            {renderStepContent()}
        </CardContent>
        <div className="p-6 border-t flex justify-between">
            <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 0}>
                Previous
            </Button>
            <Button onClick={handleNext} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {currentStep === STEPS.length - 1 ? 'Finish' : 'Next'}
            </Button>
        </div>
      </Card>
    </main>
  );
}
