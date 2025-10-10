// This file is intentionally structured to support dynamic configuration.
// In a production multi-tenant environment, these values would be fetched
// from a secure remote configuration service (like Firebase Remote Config)
// during application startup.
import 'dotenv/config';

// The setup wizard described in the architecture would be responsible for
// populating the remote config for each client.

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};
