// src/app/settings/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/use-user';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { getAuth, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { app } from '@/lib/firebase'; // Assuming your firebase app instance is exported here
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// You would ideally have a theme context or hook for dark mode
// For now, we'll use a simple state and apply class to body/html
const getInitialTheme = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const storedPrefs = window.localStorage.getItem('theme');
    if (typeof storedPrefs === 'string') {
      return storedPrefs;
    }
    const userMedia = window.matchMedia('(prefers-color-scheme: dark)');
    if (userMedia.matches) {
      return 'dark';
    }
  }
  return 'light';
};

export default function SettingsPage() {
  const { user, signOut, loading } = useUser(); // Destructure signOut
  const router = useRouter();
  const { toast } = useToast();
  const auth = getAuth(app);

  const [theme, setTheme] = useState(getInitialTheme);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, router, loading]);

  // Apply theme class to the html element
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChangingPassword(true);

    if (!user || !user.email) {
         toast({
        variant: 'destructive',
        title: 'Error',
        description: 'User not logged in or email not available.',
      });
       setIsChangingPassword(false);
       return;
    }

    if (newPassword !== confirmNewPassword) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'New passwords do not match.',
      });
       setIsChangingPassword(false);
       return;
    }

     if (!currentPassword || !newPassword || !confirmNewPassword) {
         toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Please fill in all password fields.',
          });
           setIsChangingPassword(false);
           return;
     }

    try {
      // Re-authenticate the user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update the password
      await updatePassword(user, newPassword);

      toast({
        title: 'Success',
        description: 'Your password has been updated.',
      });
       setCurrentPassword('');
       setNewPassword('');
       setConfirmNewPassword('');
    } catch (error: any) {
      console.error('Password change error:', error);
      let errorMessage = 'Failed to update password.';
      if (error.code) {
          switch (error.code) {
              case 'auth/requires-recent-login':
                  errorMessage = 'Please log out and log in again to change your password.';
                  break;
              case 'auth/invalid-credential': // This might be the error for wrong current password after reauth
              case 'auth/wrong-password': // This might also occur depending on the auth state
                  errorMessage = 'Incorrect current password.';
                  break;
              case 'auth/weak-password':
                  errorMessage = 'Password is too weak. Please choose a stronger password.';
                  break;
               case 'auth/email-already-in-use': // Should not happen for password change but good to include
                  errorMessage = 'Email already in use.';
                  break;
              default:
                  errorMessage = error.message || 'An unexpected error occurred.';
          }
      }

      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
    } finally {
      setIsChangingPassword(false);
    }

  };

  if (loading || !user) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>; // Or a better loading spinner
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-black text-foreground p-4">
      <header className="w-full max-w-2xl p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md rounded-md mt-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Settings</h1>
        <Button variant="outline" size="sm" onClick={() => router.push('/')}>
          Back to Home
        </Button>
      </header>
      <main className="flex flex-col items-center flex-1 w-full max-w-2xl py-8 space-y-6">

        {/* Profile Information Section */}
        <Card className="w-full bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden">
          <CardHeader className="bg-gray-50 dark:bg-gray-700 p-6">
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-50">Profile Information</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300 mt-2">View your account details.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
             <Avatar className="w-20 h-20">
              <AvatarImage src={user.photoURL || 'https://picsum.photos/id/237/200/300'} alt={user.displayName || 'Avatar'} />
              <AvatarFallback className="text-2xl font-semibold">{user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div className="grid gap-1 text-center sm:text-left">
                <p className="text-lg font-medium text-gray-900 dark:text-gray-50">Name: {user.displayName || 'N/A'}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Email: {user.email}</p>
                 {/* Add other profile details here if available */}
            </div>
          </CardContent>
        </Card>

        {/* Appearance Section */}
        <Card className="w-full bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden">
          <CardHeader className="bg-gray-50 dark:bg-gray-700 p-6">
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-50">Appearance</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300 mt-2">Customize the look and feel of the application.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 flex items-center justify-between">
            <Label htmlFor="theme-switch">Dark Mode</Label>
            <Switch id="theme-switch" checked={theme === 'dark'} onCheckedChange={toggleTheme} />
          </CardContent>
        </Card>

        {/* Change Password Section */}
        <Card className="w-full bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden">
           <CardHeader className="bg-gray-50 dark:bg-gray-700 p-6">
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-50">Change Password</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300 mt-2">Update your account password.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleChangePassword} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                   className="focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                  className="focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50"
                />
              </div>
              <Button type="submit" disabled={isChangingPassword}>
                {isChangingPassword ? 'Changing...' : 'Change Password'}
              </Button>
            </form>
          </CardContent>
        </Card>
        {/* Sign Out Button */}
         <Button variant="destructive" onClick={signOut} className="w-full mt-4">
            Sign Out
          </Button>
      </main>
       <footer className="w-full max-w-2xl py-6 text-center text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 mt-8">
        <p>Powered by Firebase Studio and Google Gemini API</p>
      </footer>
    </div>
  );
}
