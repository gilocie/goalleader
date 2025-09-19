'use server';

/**
 * Conversational chat flow for GoalLeader AI with defensive validation.
 */
import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'zod';

// --------------------------
// Schemas
// --------------------------
const ChatInputSchema = z.string().min(1, 'Message cannot be empty');
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.string();
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

// --------------------------
// Prompt (defined ONCE)
// --------------------------
const conversationalPrompt = ai.definePrompt({
  name: 'conversationalChatPrompt',
  model: googleAI.model('models/gemini-1.5-flash'), // ✅ correct model path
  input: { schema: z.string() },
  output: { schema: z.string() },
  config: {
    temperature: 0.7,
    maxOutputTokens: 1000,
  },
  prompt: `You are GoalLeader, an expert productivity coach and AI assistant. 
Your tone is helpful, encouraging, and friendly.

User's message: {{this}}`,
});

// --------------------------
// Flow
// --------------------------
const chatFlow = ai.defineFlow(
  {
    name: 'conversationalChatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async (message: string) => {
    console.log('Flow called with message:', message);

    if (!message.trim()) {
      console.log('Empty message, returning greeting');
      return "Hi there! How can I help you today?";
    }

    try {
      console.log('Calling Gemini prompt with validated message:', message);
      const result = await conversationalPrompt(message);
      console.log('Prompt result:', result);

      if (result && typeof result.output === 'string' && result.output.trim()) {
        return result.output.trim();
      } else {
        console.warn('Invalid prompt result:', result);
        return "I'm sorry, I couldn't generate a proper response. Please try again.";
      }
    } catch (error) {
      console.error('Prompt error:', error);
      return "I'm having trouble connecting to the AI service. Please try again later.";
    }
  }
);

// --------------------------
// Public Helpers
// --------------------------
export async function runChat(rawMessage: unknown): Promise<string> {
  console.log('=== runChat called ===');
  try {
    const parsed = ChatInputSchema.safeParse(
      typeof rawMessage === 'string' ? rawMessage : String(rawMessage ?? '')
    );

    if (!parsed.success) {
      console.error('Input validation failed:', parsed.error);
      return "I'm sorry — I couldn't read that message. Please try sending plain text.";
    }

    const message = parsed.data;

    // Run flow
    const result = await chatFlow(message);
    return typeof result === 'string' && result.trim()
      ? result
      : "I'm sorry, I couldn't generate a proper response. Please try again.";
  } catch (err) {
    console.error('=== runChat error ===', err);

    if (err instanceof Error) {
      const msg = err.message.toLowerCase();
      if (msg.includes('api key') || msg.includes('authentication')) {
        return "Authentication error: Please check your Google AI API key configuration.";
      }
      if (msg.includes('quota') || msg.includes('rate limit')) {
        return "Rate limit exceeded. Please try again later.";
      }
      if (msg.includes('network') || msg.includes('fetch')) {
        return "Network error: Please check your internet connection and try again.";
      }
    }
    return "I'm sorry, an internal error occurred while processing your request. Please try again.";
  }
}

// --------------------------
// Quick self-test for setup
// --------------------------
export async function testChatSetup(): Promise<{ success: boolean; message: string; details?: any }> {
  try {
    console.log('Testing chat setup...');
    const testResult = await runChat('Hello, this is a test message');
    console.log('Test result:', testResult);

    const isError = testResult.toLowerCase().includes('error');
    return {
      success: !isError,
      message: isError ? 'Chat setup test failed - got error result' : 'Chat setup test passed',
      details: { testResult, isError }
    };
  } catch (error) {
    console.error('Test error:', error);
    return {
      success: false,
      message: 'Chat setup test failed with exception',
      details: { error: error instanceof Error ? error.message : String(error) }
    };
  }
}