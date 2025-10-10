
import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { serviceAccount } from './serviceAccount';

export async function POST(req: NextRequest) {
  try {
    // Authenticate using the service account
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: serviceAccount.client_email,
        private_key: serviceAccount.private_key,
      },
      scopes: [
        'https://www.googleapis.com/auth/cloud-platform',
        'https://www.googleapis.com/auth/firebase.readonly',
      ],
    });

    const firebase = google.firebase({ version: 'v1beta1', auth });

    // Fetch list of Firebase projects
    const res = await firebase.projects.list();

    const projects = res.data.projects?.map((p) => ({
      projectId: p.projectId,
      displayName: p.displayName,
    })) || [];

    return NextResponse.json({ projects });

  } catch (error: any) {
    console.error('Error fetching Firebase projects:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
