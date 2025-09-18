import { NextResponse } from 'next/server';
import { runChat } from '@/ai/flows/chat-flow';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const message = body?.message ?? '';

    // call server-side runChat
    const result = await runChat(message);

    return NextResponse.json({ output: result });
  } catch (err) {
    console.error('API /api/chat error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
