
'use client';

import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons';
import Link from 'next/link';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useBranding } from '@/context/branding-context';

export default function SetupWelcomePage() {
  const { branding } = useBranding();
  const heroBg = PlaceHolderImages.find(p => p.id === 'landing-hero-bg');

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="absolute top-0 z-40 w-full">
        <div className="container mx-auto flex h-14 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold text-white">
            <Logo className="h-6 w-6 text-primary" />
            <span className="text-lg">{branding.companyName}</span>
          </Link>
        </div>
      </header>
      <main className="flex-1">
        <section className="relative w-full h-screen flex items-center justify-center text-center">
            {heroBg && (
                 <Image 
                    src={heroBg.imageUrl} 
                    alt={heroBg.description} 
                    data-ai-hint={heroBg.imageHint}
                    fill 
                    className="object-cover"
                />
            )}
            <div className="absolute inset-0 bg-black/50" />
            <div className="relative z-10 container mx-auto px-4 md:px-6">
                <div className="max-w-3xl mx-auto space-y-4">
                    <h1 className="text-4xl font-bold tracking-tighter text-white sm:text-5xl md:text-6xl">
                        Welcome to {branding.companyName} Setup
                    </h1>
                    <p className="text-lg text-gray-200 md:text-xl">
                        Let's get your new system configured. It will only take a few minutes.
                    </p>
                    <div className="flex justify-center">
                         <Button size="lg" asChild>
                            <Link href="/setup/wizard">Get Started</Link>
                        </Button>
                    </div>
                </div>
            </div>
            <footer className="absolute bottom-0 w-full py-6">
                <div className="container mx-auto flex justify-center px-4 md:px-6">
                    <p className="text-sm text-white/80">© 2025 {branding.companyName}. All rights reserved.</p>
                </div>
            </footer>
        </section>
      </main>
    </div>
  );
}
