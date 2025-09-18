
'use server';
/**
 * @fileOverview A simplified chat flow for GoalReader AI.
 * This flow now takes a single message and returns a conversational response.
 *
 * - chat - The function to call from the frontend.
 * - ChatInput - Input type (a single string).
 * - ChatOutput - Output type (a single string).
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'zod';

// --- Schema Definitions ---
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
  prompt: `You are GoalLeader, a friendly and expert productivity coach. Your goal is to help the user with their tasks, goals, and performance in a conversational and encouraging way. Respond to the user's message as if you were a real human coach.

User's message:
{{this}}
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
      return "I'm sorry, an error occurred while processing your request. Please try again later.";
    }
  }
);
