
import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { UserProfile } from '../types';

interface FirebaseContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

const FirebaseContext = createContext<FirebaseContextType>({
  user: null,
  userProfile: null,
  loading: true,
  error: null,
});

const STARTUP_TIMEOUT_MS = 12000;

export const useFirebase = () => useContext(FirebaseContext);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let authGeneration = 0;
    let unsubscribeProfile: (() => void) | null = null;
    let profileTimeout: ReturnType<typeof setTimeout> | null = null;
    const authTimeout = setTimeout(() => {
      if (!active || authGeneration !== 0) return;
      setError('Não foi possível verificar sua sessão. Verifique a conexão e tente novamente.');
      setLoading(false);
    }, STARTUP_TIMEOUT_MS);

    const clearProfileListener = () => {
      if (profileTimeout) clearTimeout(profileTimeout);
      profileTimeout = null;
      if (unsubscribeProfile) unsubscribeProfile();
      unsubscribeProfile = null;
    };

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (!active) return;
      clearTimeout(authTimeout);
      clearProfileListener();
      const generation = ++authGeneration;
      setError(null);
      setUser(currentUser);
      setUserProfile(null);

      if (currentUser) {
        setLoading(true);
        profileTimeout = setTimeout(() => {
          if (!active || generation !== authGeneration) return;
          setError('A sincronização do perfil demorou demais. Verifique a conexão e tente novamente.');
          setLoading(false);
        }, STARTUP_TIMEOUT_MS);

        // Listen to user profile changes
        const userDocRef = doc(db, 'users', currentUser.uid);
        unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
          if (!active || generation !== authGeneration) return;
          if (profileTimeout) clearTimeout(profileTimeout);
          profileTimeout = null;
          setError(null);
          if (docSnap.exists()) {
            setUserProfile(docSnap.data() as UserProfile);
          } else {
            setUserProfile(null);
          }
          setLoading(false);
        }, (err) => {
          if (!active || generation !== authGeneration) return;
          if (profileTimeout) clearTimeout(profileTimeout);
          profileTimeout = null;
          console.error("Profile sync error:", err);
          setError('Não foi possível sincronizar o perfil. Verifique a conexão e tente novamente.');
          setLoading(false);
        });
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    }, (err) => {
      if (!active) return;
      clearTimeout(authTimeout);
      clearProfileListener();
      ++authGeneration;
      console.error('Auth initialization error:', err);
      setUser(null);
      setUserProfile(null);
      setError('Não foi possível verificar sua sessão. Verifique a conexão e tente novamente.');
      setLoading(false);
    });

    return () => {
      active = false;
      clearTimeout(authTimeout);
      unsubscribeAuth();
      clearProfileListener();
    };
  }, []);

  return (
    <FirebaseContext.Provider value={{ user, userProfile, loading, error }}>
      {children}
    </FirebaseContext.Provider>
  );
};
