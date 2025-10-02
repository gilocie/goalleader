
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/icons';
import Link from 'next/link';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function LoginPage() {
  const heroBg = PlaceHolderImages.find(p => p.id === 'landing-hero-bg');

  return (
    <div className="flex flex-col min-h-screen bg-background">
       <header className="absolute top-0 z-40 w-full">
        <div className="container mx-auto flex h-14 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold text-white">
            <Logo className="h-6 w-6" />
            <span className="text-lg">GoalLeader</span>
          </Link>
          <nav className="flex items-center gap-4">
             <Button variant="ghost" asChild className="text-white hover:bg-white/10 hover:text-white">
                <Link href="/login">Login</Link>
            </Button>
            <Button asChild className="bg-gradient-to-r from-primary to-green-700 text-primary-foreground hover:from-primary/90 hover:to-green-700/90">
                <Link href="/register">Sign Up</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center relative">
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
        <Card className="w-full max-w-sm z-10 bg-card/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center">
              <div className="flex justify-center pb-4">
                  <Logo className="h-10 w-10 text-primary" />
              </div>
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>Enter your email below to login to your account</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" required />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="ml-auto inline-block text-sm underline">
                  Forgot your password?
                </Link>
              </div>
              <Input id="password" type="password" required />
            </div>
            <Button type="submit" className="w-full bg-gradient-to-r from-primary to-green-700 text-primary-foreground hover:from-primary/90 hover:to-green-700/90">
              Login
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <div className="text-center text-sm">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="underline">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </Card>
      </main>

      <footer className="absolute bottom-0 w-full py-6">
        <div className="container mx-auto flex justify-center px-4 md:px-6">
            <p className="text-sm text-white/80">© 2025 GoalLeader. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
