
'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, User, signInAnonymously } from 'firebase/auth';
import { useAuth } from '..';

export function useUser() {
  const auth = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) return;
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setLoading(false);
      } else {
        // If no user, sign in anonymously
        signInAnonymously(auth)
          .then((cred) => {
            setUser(cred.user);
          })
          .catch((error) => {
            console.error("Anonymous sign-in failed:", error);
          })
          .finally(() => {
            setLoading(false);
          });
      }
    });

    return () => unsubscribe();
  }, [auth]);

  return { user, loading };
}

    