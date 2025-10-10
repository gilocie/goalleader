
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/icons';
import Link from 'next/link';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useBranding } from '@/context/branding-context';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


export default function RegisterPage() {
  const { branding } = useBranding();
  const [showPassword, setShowPassword] = useState(false);
  const heroBg = PlaceHolderImages.find(p => p.id === 'landing-hero-bg');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const auth = useAuth();
  const firestore = useFirestore();
  const { allTeamMembers } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const departments = [...new Set(allTeamMembers.map(m => m.department))];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== repeatPassword) {
        toast({
            variant: 'destructive',
            title: 'Passwords do not match',
            description: 'Please re-enter your password.',
        });
        return;
    }
    if (!auth || !firestore) return;
    setIsLoading(true);
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        await updateProfile(user, { displayName: fullName });

        const userProfileData = {
            name: fullName,
            department: department,
            role: role,
            status: 'online'
        };

        const userDocRef = doc(firestore, 'users', user.uid);
        setDoc(userDocRef, userProfileData).catch(serverError => {
          const permissionError = new FirestorePermissionError({
            path: userDocRef.path,
            operation: 'create',
            requestResourceData: userProfileData,
          });
          errorEmitter.emit('permission-error', permissionError);
        });

        toast({ title: 'Registration Successful', description: "You're now logged in." });
        router.push('/dashboard');

    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Registration Failed',
            description: error.message,
        });
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="absolute top-0 z-40 w-full">
        <div className="container mx-auto flex h-14 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold text-white">
            <Logo className="h-6 w-6 text-primary" />
            <span className="text-lg">{branding.companyName}</span>
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
          <form onSubmit={handleRegister}>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl pt-2">Create an account</CardTitle>
              <CardDescription>Enter your information to create an account</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 px-6 pb-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="full-name">Full name</Label>
                  <Input id="full-name" placeholder="Patrick Achitabwino" required value={fullName} onChange={e => setFullName(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={e => setEmail(e.target.value)} />
                </div>
              </div>
               <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="department">Department</Label>
                  <Select value={department} onValueChange={setDepartment}>
                      <SelectTrigger><SelectValue placeholder="Select Department"/></SelectTrigger>
                      <SelectContent>
                          {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                  </Select>
                </div>
                 <div className="grid gap-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={role} onValueChange={setRole}>
                       <SelectTrigger><SelectValue placeholder="Select Role"/></SelectTrigger>
                      <SelectContent>
                          {allTeamMembers.filter(m => m.department === department).map(m => <SelectItem key={m.role} value={m.role}>{m.role}</SelectItem>)}
                      </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input id="password" type={showPassword ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} />
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
                    <Input id="repeat-password" type={showPassword ? 'text' : 'password'} required value={repeatPassword} onChange={e => setRepeatPassword(e.target.value)} />
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
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
          </form>
        </Card>
      </main>

      <footer className="absolute bottom-0 w-full py-6">
        <div className="container mx-auto flex justify-center px-4 md:px-6">
            <p className="text-sm text-white/80">© 2025 {branding.companyName}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
