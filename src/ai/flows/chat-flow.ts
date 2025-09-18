
'use server';
/**
 * @fileOverview A simplified chat flow for GoalReader AI for debugging.
 * This flow now takes a single message and returns a response, ignoring history.
 *
 * - chat - The function to call from the frontend.
 * - ChatInput - Input type (now just a single string).
 * - ChatOutput - Output type (a single string).
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'zod';

// --- Schema Definitions ---
// The input is now just a single string message.
const ChatInputSchema = z.string();
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.string();
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export async function chat(input: ChatInput): Promise<ChatOutput> {
  return singlePromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'singlePrompt',
  model: googleAI.model('gemini-1.5-flash'),
  input: { schema: ChatInputSchema },
  output: { schema: ChatOutputSchema },
  prompt: `You are a helpful AI assistant. Respond to the following message:

{{input}}
`,
});

const singlePromptFlow = ai.defineFlow(
  {
    name: 'singlePromptFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async (message) => {
    try {
      const { output } = await prompt(message);
      return output || "I'm sorry, I couldn't generate a response.";
    } catch (err) {
      console.error('Chat error:', err);
      // Return a specific error message to the user.
      return "I'm sorry, an error occurred while processing your request. Please try again later.";
    }
  }
);
