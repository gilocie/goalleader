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

// Define the prompt with better error handling
const createPrompt = () => {
  try {
    console.log('Creating conversational chat prompt...');
    
    const prompt = ai.definePrompt({
      name: 'conversationalChatPrompt',
      model: googleAI.model('gemini-1.5-flash'),
      input: { schema: ChatInputSchema },
      output: { schema: ChatOutputSchema },
      config: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      },
      prompt: `You are GoalLeader, an expert productivity coach and AI assistant. Your tone is helpful, encouraging, and friendly.
You are in a conversation. Respond to the user's message in a natural, human-like way.

User's message: {{this}}`,
    });
    
    console.log('Prompt created successfully');
    return prompt;
  } catch (error) {
    console.error('Error creating prompt:', error);
    throw error;
  }
};

// Initialize the prompt
let prompt: ReturnType<typeof createPrompt> | null = null;

try {
  prompt = createPrompt();
} catch (error) {
  console.error('Failed to initialize prompt:', error);
}

// Exported helper that safely runs the prompt and always returns a string.
export async function runChat(rawMessage: unknown): Promise<string> {
  console.log('=== runChat called ===');
  console.log('Raw message:', rawMessage);
  console.log('Message type:', typeof rawMessage);
  
  try {
    // Check if prompt is initialized
    if (!prompt) {
      console.error('Prompt not initialized');
      return "AI service is not properly configured. Please check your API key and server configuration.";
    }

    // Validate input
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

    console.log('Calling AI prompt with message:', message);
    
    // Call the prompt with detailed logging
    const startTime = Date.now();
    const result = await prompt(message);
    const endTime = Date.now();
    
    console.log('AI call completed in', endTime - startTime, 'ms');
    console.log('AI result:', result);
    console.log('Result type:', typeof result);
    console.log('Result output:', result?.output);
    console.log('Output type:', typeof result?.output);

    // Validate the output
    if (result && typeof result.output === 'string' && result.output.trim()) {
      console.log('Returning successful response:', result.output);
      return result.output.trim();
    } else {
      console.warn('Invalid AI output:', result);
      return "I'm sorry, I couldn't generate a proper response. Please try again.";
    }

  } catch (err) {
    console.error('=== runChat error ===');
    console.error('Error object:', err);
    console.error('Error message:', err instanceof Error ? err.message : 'Unknown error');
    console.error('Error stack:', err instanceof Error ? err.stack : 'No stack trace');
    
    // Check for specific error types
    if (err instanceof Error) {
      const errorMessage = err.message.toLowerCase();
      
      if (errorMessage.includes('api key') || errorMessage.includes('authentication')) {
        console.error('Authentication error detected');
        return "Authentication error: Please check your Google AI API key configuration.";
      }
      
      if (errorMessage.includes('quota') || errorMessage.includes('rate limit')) {
        console.error('Rate limit error detected');
        return "Rate limit exceeded. Please try again later.";
      }
      
      if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        console.error('Network error detected');
        return "Network error: Please check your internet connection and try again.";
      }
      
      if (errorMessage.includes('model') || errorMessage.includes('gemini')) {
        console.error('Model error detected');
        return "Model error: There's an issue with the AI model configuration.";
      }
    }

    return "I'm sorry, an internal error occurred while processing your request. Please try again.";
  }
}

// Backward compatibility
export async function chat(input: ChatInput): Promise<ChatOutput> {
  return runChat(input);
}

// Test function to verify setup
export async function testChatSetup(): Promise<{ success: boolean; message: string; details?: any }> {
  try {
    console.log('Testing chat setup...');
    
    if (!prompt) {
      return {
        success: false,
        message: 'Prompt not initialized',
        details: { promptExists: false }
      };
    }
    
    const testResult = await runChat('Hello, this is a test message');
    
    return {
      success: true,
      message: 'Chat setup test passed',
      details: { testResult, promptExists: true }
    };
  } catch (error) {
    return {
      success: false,
      message: 'Chat setup test failed',
      details: { error: error instanceof Error ? error.message : String(error) }
    };
  }
}
