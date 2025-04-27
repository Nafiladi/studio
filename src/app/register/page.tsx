
'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {useToast} from '@/hooks/use-toast';
import {useUser} from '@/hooks/use-user';
import Link from 'next/link';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const {signUp} = useUser();
  const {toast} = useToast();
  const router = useRouter();

  const handleRegister = async () => {
    setIsLoading(true);
    try {
      await signUp(email, password, displayName);
      toast({
        title: 'Registration Successful!',
        description: 'Your account has been created successfully.',
      });
      router.push('/'); // Redirect to home page after registration
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: error.message || 'Failed to create account.',
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
            <CardTitle className="transition-colors duration-300">Register</CardTitle>
            <CardDescription className="transition-colors duration-300">Create an account to start generating animations.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Input
                type="text"
                placeholder="Display Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="transition-colors duration-300 focus-visible:ring-accent"
              />
            </div>
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
            <Button onClick={handleRegister} disabled={isLoading} className="transition-colors duration-300 hover:bg-accent hover:text-accent-foreground">
              {isLoading ? 'Registering...' : 'Register'}
            </Button>
            <p className="text-sm text-muted-foreground transition-colors duration-300">
              Already have an account? <Link href="/login" className="text-primary underline transition-colors duration-300 hover:text-accent">Login</Link>
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
