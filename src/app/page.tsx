'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons';
import { ArrowRight } from 'lucide-react';

export default function LandingPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <header className="px-4 lg:px-6 h-14 flex items-center">
                <Link href="/" className="flex items-center justify-center">
                    <Logo className="h-6 w-6 text-primary" />
                    <span className="sr-only">GoalLeader</span>
                </Link>
                <nav className="ml-auto flex gap-4 sm:gap-6">
                    <Button variant="ghost" asChild>
                        <Link href="/login">Login</Link>
                    </Button>
                     <Button asChild>
                        <Link href="/register">Get Started</Link>
                    </Button>
                </nav>
            </header>
            <main className="flex-1">
                <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
                    <div className="container px-4 md:px-6">
                        <div className="grid gap-6 lg:grid-cols-1">
                             <div className="flex flex-col justify-center space-y-4 text-center">
                                <div className="space-y-2">
                                    <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                                        GoalLeader
                                    </h1>
                                    <p className="max-w-[600px] text-muted-foreground md:text-xl mx-auto">
                                        The AI-powered platform to track progress, manage tasks, and drive performance.
                                    </p>
                                </div>
                                <div className="flex justify-center flex-col gap-2 min-[400px]:flex-row">
                                    <Button asChild size="lg" className="bg-gradient-to-r from-primary to-green-700 text-primary-foreground hover:from-primary/90 hover:to-green-700/90">
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
             <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
                <p className="text-xs text-muted-foreground">&copy; 2024 GoalLeader. All rights reserved.</p>
                <nav className="sm:ml-auto flex gap-4 sm:gap-6">
                <Link href="#" className="text-xs hover:underline underline-offset-4">
                    Terms of Service
                </Link>
                <Link href="#" className="text-xs hover:underline underline-offset-4">
                    Privacy
                </Link>
                </nav>
            </footer>
        </div>
    );
}
