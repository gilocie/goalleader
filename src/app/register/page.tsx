
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/icons';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
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
        <Card className="w-full max-w-md z-10 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center">
              <div className="flex justify-center pb-2">
                  <Logo className="h-10 w-10 text-primary" />
              </div>
            <CardTitle className="text-2xl">Create an account</CardTitle>
            <CardDescription>Enter your information to create an account</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 px-6 pb-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="full-name">Full name</Label>
                <Input id="full-name" placeholder="Patrick Achitabwino" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="m@example.com" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? 'text' : 'password'} required />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </Button>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="repeat-password">Repeat password</Label>
                <div className="relative">
                  <Input id="repeat-password" type={showPassword ? 'text' : 'password'} required />
                   <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </Button>
                </div>
              </div>
            </div>
            <Button type="submit" className="w-full bg-gradient-to-r from-primary to-green-700 text-primary-foreground hover:from-primary/90 hover:to-green-700/90">
              Create account
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 pt-0 pb-4">
            <div className="text-center text-sm">
              Already have an account?{' '}
              <Link href="/login" className="underline">
                Login
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
