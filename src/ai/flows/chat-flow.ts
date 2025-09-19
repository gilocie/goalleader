
'use server';

/**
 * Conversational chat flow for GoalLeader AI with defensive validation.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'zod';

const ChatInputSchema = z.string().min(0);
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.string();
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

// Create a proper flow instead of just a prompt
const chatFlow = ai.defineFlow({
  name: 'conversationalChatFlow',
  inputSchema: ChatInputSchema,
  outputSchema: ChatOutputSchema,
}, async (message: string) => {
  console.log('Flow called with message:', message);
  
  // Handle empty or invalid input
  if (!message || typeof message !== 'string') {
    console.log('Empty or invalid message, returning greeting');
    return "Hi there! How can I help you today?";
  }

  try {
    const prompt = ai.definePrompt({
      name: 'conversationalChatPrompt',
      model: googleAI.model('gemini-1.5-flash'),
      input: { schema: z.string() },
      output: { schema: z.string() },
      config: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      },
      prompt: `You are GoalLeader, an expert productivity coach and AI assistant. Your tone is helpful, encouraging, and friendly.
You are in a conversation. Respond to the user's message in a natural, human-like way.

User's message: {{this}}`,
    });

    console.log('Calling prompt with validated message:', message);
    const result = await prompt(message);
    console.log('Prompt result:', result);
    
    if (result && result.output && typeof result.output === 'string' && result.output.trim()) {
      return result.output.trim();
    } else {
      console.warn('Invalid prompt result:', result);
      return "I'm sorry, I couldn't generate a proper response. Please try again.";
    }
  } catch (error) {
    console.error('Prompt error:', error);
    // Return a user-friendly error message instead of throwing
    return "I'm having trouble connecting to the AI service. Please try again later.";
  }
});

// Exported helper that safely runs the flow and always returns a string.
export async function runChat(rawMessage: unknown): Promise<string> {
  console.log('=== runChat called ===');
  console.log('Raw message:', rawMessage);
  console.log('Message type:', typeof rawMessage);
  
  try {
    // Validate and coerce input to string
    const parsed = ChatInputSchema.safeParse(
      typeof rawMessage === 'string' ? rawMessage : String(rawMessage ?? '')
    );

    if (!parsed.success) {
      console.error('Input validation failed:', parsed.error);
      return "I'm sorry — I couldn't read that message. Please try sending plain text.";
    }

    const message = parsed.data;
    console.log('Validated message:', message);

    // Handle empty messages
    if (!message.trim()) {
      console.log('Empty message, returning greeting');
      return "Hi there! How can I help you today?";
    }

    console.log('Calling chat flow with message:', message);
    
    // Call the flow with proper error handling
    const startTime = Date.now();
    const result = await chatFlow(message);
    const endTime = Date.now();
    
    console.log('Flow completed in', endTime - startTime, 'ms');
    console.log('Flow result:', result);

    if (typeof result === 'string' && result.trim()) {
      return result;
    } else {
      console.warn('Invalid flow result:', result);
      return "I'm sorry, I couldn't generate a proper response. Please try again.";
    }

  } catch (err) {
    console.error('=== runChat error ===');
    console.error('Error object:', err);
    console.error('Error message:', err instanceof Error ? err.message : 'Unknown error');
    
    // Check for specific error types
    if (err instanceof Error) {
      const errorMessage = err.message.toLowerCase();
      
      if (errorMessage.includes('api key') || errorMessage.includes('authentication')) {
        return "Authentication error: Please check your Google AI API key configuration.";
      }
      
      if (errorMessage.includes('quota') || errorMessage.includes('rate limit')) {
        return "Rate limit exceeded. Please try again later.";
      }
      
      if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        return "Network error: Please check your internet connection and try again.";
      }
    }

    return "I'm sorry, an internal error occurred while processing your request. Please try again.";
  }
}

// Test function with proper error handling
export async function testChatSetup(): Promise<{ success: boolean; message: string; details?: any }> {
  try {
    console.log('Testing chat setup...');
    
    const testResult = await runChat('Hello, this is a test message');
    console.log('Test result:', testResult);
    
    // Check if we got a meaningful response (not an error message)
    const isError = testResult.toLowerCase().includes('error');
    
    return {
      success: !isError,
      message: isError ? 'Chat setup test failed - got error response' : 'Chat setup test passed',
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
