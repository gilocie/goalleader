
'use server';
/**
 * @fileOverview A conversational flow for the GoalLeader AI assistant.
 *
 * - chat - A function that provides a conversational response.
 * - ChatInput - The input type for the function.
 * - ChatOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'zod';

// Input is a simple string from the user
const ChatInputSchema = z.string();
export type ChatInput = z.infer<typeof ChatInputSchema>;

// Output is a simple string response from the AI
const ChatOutputSchema = z.string();
export type ChatOutput = z.infer<typeof ChatOutputSchema>;


export async function chat(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'conversationalChatPrompt',
  model: googleAI.model('gemini-1.5-flash'),
  input: { schema: ChatInputSchema },
  output: { schema: ChatOutputSchema },
  prompt: `You are GoalLeader, an expert productivity coach and AI assistant. Your tone is helpful, encouraging, and friendly. 
You are in a conversation. Respond to the user's message in a natural, human-like way.

User's message: {{this}}
`,
});

const chatFlow = ai.defineFlow(
  {
    name: 'conversationalChatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async (message) => {
    const { output } = await prompt(message);
    if (!output) {
      return "I'm sorry, I couldn't come up with a response. Could you try rephrasing?";
    }
    return output;
  }
);
