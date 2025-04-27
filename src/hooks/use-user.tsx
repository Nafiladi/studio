'use client';

import {useState, useEffect, createContext, useContext} from 'react';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import {app} from '@/lib/firebase'; // Ensure this path is correct
import {initializeApp} from 'firebase/app';

type User = FirebaseUser | null;

interface AuthContextType {
  user: User;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (displayName: string, photoURL: string | null) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [user, setUser] = useState<User>(null);
  const [isFirebaseInitialized, setIsFirebaseInitialized] = useState(false);
  const [auth, setAuth] = useState<ReturnType<typeof getAuth> | null>(null);
  const [initializationError, setInitializationError] = useState<any>(null);

  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        // Check if Firebase is already initialized
        if (app) {
          setIsFirebaseInitialized(true);
          return;
        }

        // Initialize Firebase (if not already initialized)
        initializeApp({
          apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
          authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
          appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
          measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
        });

        setIsFirebaseInitialized(true);
      } catch (error: any) {
        console.error('Firebase initialization error:', error);
        setInitializationError(error); // Capture the error
        // Handle initialization error appropriately
      }
    };

    initializeFirebase();
  }, []);

  useEffect(() => {
    if (isFirebaseInitialized) {
      try {
        const authInstance = getAuth(app);
        setAuth(authInstance);
      } catch (error: any) {
        console.error("Error initializing Firebase Auth:", error);
        setInitializationError(error); // Capture the error
      }
    }
  }, [isFirebaseInitialized]);

  useEffect(() => {
    if (!auth) return;

    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      setUser(authUser);
    });

    return () => unsubscribe();
  }, [auth]);

  const signUp = async (email: string, password: string, displayName: string) => {
    if (!auth) throw new Error('Firebase not initialized');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, {displayName});
      setUser(userCredential.user);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!auth) throw new Error('Firebase not initialized');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const signOut = async () => {
    if (!auth) throw new Error('Firebase not initialized');
    try {
      await firebaseSignOut(auth);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const updateUser = async (displayName: string, photoURL: string | null) => {
    if (!auth) throw new Error('Firebase not initialized');
    if (!user) {
      throw new Error('No user is currently signed in.');
    }

    try {
      await updateProfile(auth.currentUser!, {displayName, photoURL});
      setUser(auth.currentUser); // Refresh local user state
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const value: AuthContextType = {
    user,
    signUp,
    signIn,
    signOut,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useUser must be used within an AuthProvider');
  }
  return context;
};
