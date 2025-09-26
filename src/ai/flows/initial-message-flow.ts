
'use server';
/**
 * @fileOverview A flow to generate a personalized initial greeting.
 *
 * - getInitialMessage - A function that generates a welcome message.
 * - InitialMessageInput - The input type for the getInitialMessage function.
 * - InitialMessageOutput - The return type for the getInitialMessage function.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'zod';

const InitialMessageInputSchema = z.object({
  name: z.string().describe("The user's name."),
});
export type InitialMessageInput = z.infer<typeof InitialMessageInputSchema>;

const InitialMessageOutputSchema = z.string();
export type InitialMessageOutput = z.infer<typeof InitialMessageOutputSchema>;

export async function getInitialMessage(input: InitialMessageInput): Promise<InitialMessageOutput> {
  return initialMessageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'initialMessagePrompt',
  model: googleAI.model('gemini-pro'),
  input: { schema: InitialMessageInputSchema },
  output: { schema: InitialMessageOutputSchema },
  prompt: `You are GoalLeader, an expert productivity coach and AI assistant. 
Your tone is helpful, encouraging, and friendly.

Generate a short, welcoming initial message for a user named {{name}}. 
The message should be encouraging and ask how you can help them today. Avoid being repetitive.

Example: "Hi {{name}}! Ready to make some progress today? Let me know what you'd like to work on."
`,
});

const initialMessageFlow = ai.defineFlow(
  {
    name: 'initialMessageFlow',
    inputSchema: InitialMessageInputSchema,
    outputSchema: InitialMessageOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await prompt(input);
      return output || `Hi ${input.name}! How can I help you today?`;
    } catch (error) {
      console.error('Error generating initial message:', error);
      return `Hi ${input.name}! I'm here to help you achieve your goals. What's on your mind?`;
    }
  }
);
