
import { NextResponse } from 'next/server';
import { runChat, testChatSetup, ChatInput } from '@/ai/flows/chat-flow';
import { testConnection } from '@/ai/genkit';

export async function POST(req: Request) {
  console.log('=== API /api/chat POST called ===');

  try {
    const body = await req.json();
    console.log('Request body parsed:', body);
    
    // The body is now the full ChatInput object
    const input: ChatInput = body;

    if (typeof input.message !== 'string') {
      return NextResponse.json(
        { error: 'Message must be a string' },
        { status: 400 }
      );
    }
    
    console.log('Calling runChat with input:', input);

    const startTime = Date.now();
    const result = await runChat(input);
    const endTime = Date.now();

    console.log('runChat completed in', endTime - startTime, 'ms');
    console.log('runChat result:', result);

    if (typeof result !== 'string') {
      console.error('runChat returned non-string:', { result, type: typeof result });
      return NextResponse.json(
        { error: 'Internal error: invalid response type' },
        { status: 500 }
      );
    }

    console.log('Returning successful response');
    return NextResponse.json({ output: result });

  } catch (err) {
    console.error('=== API Error ===');
    console.error('Error:', err);
    console.error('Error message:', err instanceof Error ? err.message : 'Unknown error');
    console.error('Error stack:', err instanceof Error ? err.stack : 'No stack trace');

    return NextResponse.json(
      { error: 'Internal server error', details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}


// GET endpoint for debugging and testing
export async function GET() {
  console.log('=== API /api/chat GET called (debug endpoint) ===');
  
  try {
    // Test connection
    const connectionTest = await testConnection();
    console.log('Connection test result:', connectionTest);
    
    // Test chat setup
    const chatTest = await testChatSetup();
    console.log('Chat test result:', chatTest);
    
    // Environment check
    const hasApiKey = !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_GENAI_API_KEY);
    
    const debugInfo = {
      status: 'debug endpoint',
      timestamp: new Date().toISOString(),
      environment: {
        hasApiKey,
        nodeEnv: process.env.NODE_ENV,
      },
      tests: {
        connection: connectionTest,
        chat: chatTest,
      }
    };
    
    console.log('Debug info:', debugInfo);
    
    return NextResponse.json(debugInfo);
  } catch (error) {
    console.error('Debug endpoint error:', error);
    
    return NextResponse.json({
      status: 'debug endpoint error',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
