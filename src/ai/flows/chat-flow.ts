'use server';

/**
 * Conversational chat flow for GoalLeader AI with defensive validation.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'zod';

const ChatInputSchema = z.string().min(0); // allow empty string, but enforce string type
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.string();
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

// Prompt definition
const prompt = ai.definePrompt({
  name: 'conversationalChatPrompt',
  model: googleAI.model('gemini-1.5-flash'), // keep as-is, ensure credentials are present in env
  input: { schema: ChatInputSchema },
  output: { schema: ChatOutputSchema },
  prompt: `You are GoalLeader, an expert productivity coach and AI assistant. Your tone is helpful, encouraging, and friendly.
You are in a conversation. Respond to the user's message in a natural, human-like way.

User's message: {{this}}
`,
});

// Exported helper that safely runs the prompt and always returns a string.
export async function runChat(rawMessage: unknown): Promise<string> {
  try {
    // coerce and validate input to a string using zod
    const parsed = ChatInputSchema.safeParse(
      typeof rawMessage === 'string' ? rawMessage : String(rawMessage ?? '')
    );

    if (!parsed.success) {
      console.error('runChat: input failed validation', parsed.error);
      // use fallback empty string to avoid Genkit schema errors
      return "I'm sorry — I couldn't read that message. Please try sending plain text.";
    }

    const message = parsed.data; // guaranteed string (maybe empty)

    // Call the prompt
    const { output } = await prompt(message);

    if (typeof output === 'string' && output.trim()) {
      return output;
    } else {
      // fallback response
      return "I'm sorry, I couldn't generate a response. Please try again or rephrase.";
    }
  } catch (err) {
    console.error('runChat error:', err, 'rawMessage:', rawMessage);
    return "I'm sorry, an internal error occurred while processing your request.";
  }
}

// Previous chat function for direct import - deprecated in favor of API route
export async function chat(input: ChatInput): Promise<ChatOutput> {
  return runChat(input);
}
