
'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {useToast} from '@/hooks/use-toast';
import {useUser} from '@/hooks/use-user';
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox'; // Import Checkbox
import { Label } from '@/components/ui/label'; // Import Label
import { getAuth, setPersistence, browserSessionPersistence, browserLocalPersistence } from 'firebase/auth'; // Import persistence functions
import { app } from '@/lib/firebase'; // Import your Firebase app instance

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false); // State for checkbox
  const [isLoading, setIsLoading] = useState(false);
  const {signIn} = useUser();
  const {toast} = useToast();
  const router = useRouter();
  const auth = getAuth(app); // Get Firebase Auth instance

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      // Set persistence based on rememberMe state
      // If rememberMe is true, use browserLocalPersistence (keeps user logged in)
      // If rememberMe is false, use browserSessionPersistence (logs out on browser close)
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);

      // Proceed with sign-in
      await signIn(email, password);
      toast({
        title: 'Login Successful!',
        description: 'You have successfully logged in.',
      });
      router.push('/'); // Redirect to home page after login
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.message || 'Invalid credentials.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-background">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-4 text-center">
        <Card className="w-full max-w-md transition-shadow duration-300 hover:shadow-lg">
          <CardHeader>
            <CardTitle className="transition-colors duration-300">Login</CardTitle>
            <CardDescription className="transition-colors duration-300">Enter your credentials to access your account.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="transition-colors duration-300 focus-visible:ring-accent"
              />
            </div>
            <div className="grid gap-2">
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="transition-colors duration-300 focus-visible:ring-accent"
              />
            </div>
             {/* Remember Me Checkbox - Controls Firebase Authentication Persistence */}
            <div className="flex items-center space-x-2">
              <Checkbox id="remember-me" checked={rememberMe} onCheckedChange={(checked) => setRememberMe(checked === true)} />
              <Label htmlFor="remember-me" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Remember me
              </Label>
            </div>
            <Button onClick={handleLogin} disabled={isLoading} className="transition-colors duration-300 hover:bg-accent hover:text-accent-foreground">
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
            <p className="text-sm text-muted-foreground transition-colors duration-300">
              Don't have an account? <Link href="/register" className="text-primary underline transition-colors duration-300 hover:text-accent">Register</Link>
            </p>
          </CardContent>
        </Card>
      </main>
      <footer className="flex items-center justify-center w-full h-24 border-t transition-colors duration-300">
        <p className="text-sm text-muted-foreground transition-colors duration-300">
          Powered by Firebase Studio
        </p>
      </footer>
    </div>
  );
}
