
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
import {RedoIcon, SettingsIcon} from 'lucide-react'; // Import SettingsIcon
import Link from 'next/link'; // Import Link

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
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-black text-foreground">
      <header className="w-full p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-50 tracking-tight">AnimateAI</h1>
        <div className="flex items-center space-x-4">
           {/* Removed onClick handler and cursor-pointer */}
           <div className="flex items-center space-x-2">
            <span className="text-gray-700 dark:text-gray-300 hidden sm:inline">{user.displayName || user.email}</span>
            <Avatar className="w-9 h-9">
              <AvatarImage src={user.photoURL || 'https://picsum.photos/id/237/200/300'} alt={user.displayName || 'Avatar'} />
              <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
           </div>
           {/* Add Settings Button/Link */}
           <Link href="/settings">
             <Button variant="ghost" size="icon" aria-label="Settings">
               <SettingsIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
             </Button>
           </Link>

          <Button variant="outline" size="sm" onClick={signOut} className="border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-gray-700 dark:hover:text-blue-300">
            Sign Out
          </Button>
        </div>
      </header>
      <main className="flex flex-col items-center justify-center flex-1 w-full px-4 py-8">
        <Card className="w-full max-w-xl bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden">
          <CardHeader className="bg-gray-50 dark:bg-gray-700 p-6">
            <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-gray-50">Animation Generator</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300 mt-2">Bring your ideas to life with AI-powered animations.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 grid gap-6">
            <div className="grid gap-2">
              <Textarea
                placeholder="Describe the animation you want to create... e.g., 'A cat jumping over a fence'"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[120px] resize-none focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <Button
                onClick={handleGenerateAnimation}
                disabled={isLoading || !prompt.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
              >
                {isLoading ? 'Generating...' : 'Generate Animation'}
              </Button>
              <Button
                variant="secondary"
                onClick={handleImprovePrompt}
                disabled={isImproving || !prompt.trim()}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
              >
                {isImproving ? (
                  <>
                    Improving... <RedoIcon className="ml-2 h-4 w-4 animate-spin" />
                  </>
                ) : (
                  <>Improve Prompt <RedoIcon className="ml-2 h-4 w-4" /></>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
        {animationDataUri && (
          <div className="mt-12 w-full max-w-xl bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-50 mb-4 text-center">Generated Animation</h2>
            <div className="relative" style={{paddingTop: '56.25%'}}> {/* 16:9 Aspect Ratio */}
              <video
                src={animationDataUri}
                controls
                className="absolute top-0 left-0 w-full h-full rounded-md object-cover"
              ></video>
            </div>
          </div>
        )}
      </main>
      <footer className="w-full py-6 text-center text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 mt-8">
        <p>Powered by Firebase Studio and Google Gemini API</p>
      </footer>
    </div>
  );
}
