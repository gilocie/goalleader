
'use client';
import { ReactNode, useMemo } from 'react';
import { initializeFirebase, FirebaseProvider } from '.';

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const { app, auth, firestore } = useMemo(() => initializeFirebase(), []);

  return (
    <FirebaseProvider app={app} auth={auth} firestore={firestore}>
      {children}
    </FirebaseProvider>
  );
}

    