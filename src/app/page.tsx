
'use client';

import {useState, useEffect} from 'react';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Textarea} from '@/components/ui/textarea';
import {useToast} from '@/hooks/use-toast';
import {generateAnimation} from '@/ai/flows/generate-animation';
import {useUser} from '@/hooks/use-user';
import {useRouter} from 'next/navigation';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {improveAnimationPrompt} from '@/ai/flows/improve-prompt';
import {RedoIcon} from 'lucide-react';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [animationDataUri, setAnimationDataUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const {toast} = useToast();
  const {user, signOut} = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const handleGenerateAnimation = async () => {
    setIsLoading(true);
    try {
      const result = await generateAnimation({prompt});
      setAnimationDataUri(result.animationDataUri);
      toast({
        title: 'Animation Generated!',
        description: 'Your animation has been generated successfully.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to generate animation.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImprovePrompt = async () => {
    setIsImproving(true);
    try {
      const result = await improveAnimationPrompt({prompt});
      setPrompt(result.improvedPrompt);
      toast({
        title: 'Prompt Improved!',
        description: 'Your prompt has been improved by AI.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to improve prompt.',
      });
    } finally {
      setIsImproving(false);
    }
  };

  if (!user) {
    return null; // or a loading indicator
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-background">
      <header className="w-full flex justify-between items-center p-4">
        <h1 className="text-2xl font-bold tracking-tight transition-colors duration-300">AnimateAI</h1>
        <div className="flex items-center space-x-4">
          <Avatar className="transition-transform duration-300 hover:scale-105">
            <AvatarImage src={user.photoURL || 'https://picsum.photos/id/237/200/300'} alt={user.displayName || 'Avatar'} />
            <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <span className="transition-colors duration-300">{user.displayName || user.email}</span>
          <Button variant="outline" size="sm" onClick={signOut} className="transition-colors duration-300 hover:bg-secondary hover:text-secondary-foreground">
            Sign Out
          </Button>
        </div>
      </header>
      <main className="flex flex-col items-center justify-center w-full flex-1 px-4 text-center">
        <Card className="w-full max-w-md transition-shadow duration-300 hover:shadow-lg">
          <CardHeader>
            <CardTitle className="transition-colors duration-300">Animation Generator</CardTitle>
            <CardDescription className="transition-colors duration-300">Enter a prompt to generate an animation.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Textarea
                placeholder="Enter your prompt here."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="transition-colors duration-300 focus-visible:ring-accent"
              />
            </div>
            <div className="flex justify-between">
              <Button onClick={handleGenerateAnimation} disabled={isLoading} className="transition-colors duration-300 hover:bg-accent hover:text-accent-foreground">
                {isLoading ? 'Generating...' : 'Generate Animation'}
              </Button>
              <Button
                variant="secondary"
                onClick={handleImprovePrompt}
                disabled={isImproving}
                className="transition-colors duration-300 hover:bg-primary hover:text-primary-foreground"
              >
                {isImproving ? (
                  <>
                    Improving... <RedoIcon className="ml-2 h-4 w-4 animate-spin" />
                  </>
                ) : (
                  'Improve Prompt'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
        {animationDataUri && (
          <div className="mt-8 transition-opacity duration-300">
            <h2 className="text-xl font-semibold mb-4 transition-colors duration-300">Generated Animation</h2>
            <video src={animationDataUri} controls width="640" height="360" className="rounded-lg shadow-md transition-shadow duration-300"></video>
          </div>
        )}
      </main>
      <footer className="flex items-center justify-center w-full h-24 border-t transition-colors duration-300">
        <p className="text-sm text-muted-foreground transition-colors duration-300">
          Powered by Firebase Studio and Google Gemini API
        </p>
      </footer>
    </div>
  );
}
