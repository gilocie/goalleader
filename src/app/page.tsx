'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function LandingPage() {
    const heroBg = PlaceHolderImages.find(img => img.id === 'landing-hero-bg');

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <header className="px-4 lg:px-6 h-14 flex items-center absolute top-0 left-0 right-0 z-20 bg-transparent">
                <Link href="/" className="flex items-center justify-center text-white">
                    <Logo className="h-6 w-6" />
                    <span className="sr-only">GoalLeader</span>
                </Link>
                <nav className="ml-auto flex gap-4 sm:gap-6">
                    <Button variant="ghost" asChild className="text-white hover:bg-white/20 hover:text-white">
                        <Link href="/login">Login</Link>
                    </Button>
                     <Button asChild variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-primary">
                        <Link href="/register">Get Started</Link>
                    </Button>
                </nav>
            </header>
            <main className="flex-1">
                <section className="relative w-full h-screen flex items-center justify-center">
                    {heroBg && (
                         <Image
                            src={heroBg.imageUrl}
                            alt={heroBg.description}
                            data-ai-hint={heroBg.imageHint}
                            layout="fill"
                            objectFit="cover"
                            quality={100}
                            className="z-0"
                        />
                    )}
                    <div className="absolute inset-0 bg-green-900/70 z-10" />

                    <div className="relative z-20 container px-4 md:px-6">
                        <div className="grid gap-6 lg:grid-cols-1">
                             <div className="flex flex-col justify-center space-y-4 text-center">
                                <div className="space-y-2">
                                    <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-white">
                                        GoalLeader
                                    </h1>
                                    <p className="max-w-[600px] text-green-100 md:text-xl mx-auto">
                                        Track progress, manage tasks, and drive performance.
                                    </p>
                                </div>
                                <div className="flex justify-center flex-col gap-2 min-[400px]:flex-row">
                                    <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
                                        <Link href="/dashboard">
                                            Go to Dashboard
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <footer className="absolute bottom-0 left-0 right-0 z-20 p-4 bg-transparent text-center text-white/70 text-sm">
                © {new Date().getFullYear()} GoalLeader. All rights reserved.
            </footer>
        </div>
    );
}
