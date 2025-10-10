
import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, App } from 'firebase-admin/app';
import { serviceAccount } from './serviceAccount';

// Initialize Firebase Admin SDK if not already initialized
if (!getApps().length) {
  initializeApp({
    credential: {
      projectId: serviceAccount.project_id,
      clientEmail: serviceAccount.client_email,
      privateKey: serviceAccount.private_key,
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const authorization = req.headers.get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized: Missing or invalid token' }, { status: 401 });
    }
    const idToken = authorization.split('Bearer ')[1];

    // Verify the ID token to ensure the user is authenticated
    const decodedToken = await getAuth().verifyIdToken(idToken);
    
    // The user's Google OAuth2 access token should be available via Google Sign-In
    // However, the ID token doesn't contain the access token needed for the Management API.
    // For a production app, you would need to request the 'https://www.googleapis.com/auth/cloud-platform.readonly'
    // scope during sign-in and securely handle the access token.

    // For this demonstration, we'll proceed with a service account which has broader access.
    // This is NOT ideal for security as it doesn't scope projects to the logged-in user.
    // A production implementation should use the user's OAuth2 token.

    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: serviceAccount.client_email,
            private_key: serviceAccount.private_key,
        },
        scopes: ['https://www.googleapis.com/auth/cloud-platform.readonly', 'https://www.googleapis.com/auth/firebase.readonly'],
    });

    const authClient = await auth.getClient();
    google.options({ auth: authClient });

    const firebase = google.firebase('v1beta1');
    
    const response = await firebase.projects.list({ pageSize: 100 });
    
    const projects = response.data.projects || [];
    
    // Filter projects to only those in the 'ACTIVE' state
    const activeProjects = projects.filter(p => p.state === 'ACTIVE');

    return NextResponse.json({ projects: activeProjects });
  } catch (error: any) {
    console.error("Error fetching Firebase projects:", error.message);
    if (error.code === 'auth/id-token-expired') {
        return NextResponse.json({ error: 'Authentication token expired. Please sign in again.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

// Dummy service account file content
const serviceAccount = {
  "type": "service_account",
  "project_id": process.env.GCP_PROJECT_ID || "your-gcp-project-id",
  "private_key_id": process.env.GCP_PRIVATE_KEY_ID || "your-private-key-id",
  "private_key": (process.env.GCP_PRIVATE_KEY || "your-private-key").replace(/\\n/g, '\n'),
  "client_email": process.env.GCP_CLIENT_EMAIL || "your-client-email",
  "client_id": process.env.GCP_CLIENT_ID || "your-client-id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": process.env.GCP_CLIENT_X509_CERT_URL || "your-client-x509-cert-url"
};
