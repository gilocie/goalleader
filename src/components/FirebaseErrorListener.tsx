'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import type { FirestorePermissionError } from '@/firebase/errors';

// This component is responsible for listening to custom Firestore permission
// errors and throwing them in a way that Next.js's development overlay can
// beautifully render them with full context.
export function FirebaseErrorListener() {
  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      // We throw a new error here to get a clean stack trace from this point,
      // making it easier to see where the error is being surfaced.
      // The original error's rich context is preserved in the message.
      throw new Error(error.toString());
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  // This component does not render anything to the DOM.
  return null;
}
