// This file is intentionally structured to support dynamic configuration.
// In a production multi-tenant environment, these values would be fetched
// from a secure remote configuration service (like Firebase Remote Config)
// during application startup.

// The setup wizard described in the architecture would be responsible for
// populating the remote config for each client.

export const firebaseConfig = {
  // IMPORTANT: Replace these placeholder values with your actual
  // Firebase project's "Web app" configuration.
  // You can find this in your Firebase project settings.
  apiKey: "your-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};
