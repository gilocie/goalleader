
import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, App } from 'firebase-admin/app';
import { serviceAccount } from './serviceAccount';

// Initialize Firebase Admin SDK if not already initialized
// This part is kept for potential future use but is not critical for the mock.
if (!getApps().length) {
  try {
    initializeApp({
      credential: {
        projectId: serviceAccount.project_id,
        clientEmail: serviceAccount.client_email,
        privateKey: serviceAccount.private_key,
      },
    });
  } catch (error) {
    console.error("Firebase Admin Initialization Error:", error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const authorization = req.headers.get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized: Missing or invalid token' }, { status: 401 });
    }
    const idToken = authorization.split('Bearer ')[1];
    
    // In a real scenario, you would verify the token.
    // We will simulate a successful verification for this mock.
    if (!idToken) {
      throw new Error("Invalid token");
    }

    // --- MOCK IMPLEMENTATION ---
    // Instead of calling the Google API with placeholder credentials,
    // we return a mock list of projects to simulate a successful API call.
    const mockProjects = [
      { projectId: 'goalleader-prod-1a2b3', displayName: 'GoalLeader Production' },
      { projectId: 'goalleader-dev-4c5d6', displayName: 'GoalLeader Development' },
      { projectId: 'analytics-dashboard-7e8f9', displayName: 'Analytics Dashboard' },
    ];
    
    // Simulate a network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json({ projects: mockProjects });

  } catch (error: any) {
    console.error("Error in /api/firebase/getProjects:", error.message);
    // Return a more generic error to avoid exposing implementation details.
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
