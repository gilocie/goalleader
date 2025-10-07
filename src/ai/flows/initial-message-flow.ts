
'use server';
/**
 * @fileOverview A flow to generate a personalized initial greeting.
 *
 * - getInitialMessage - A function that generates a welcome message.
 * - InitialMessageInput - The input type for the getInitialMessage function.
 * - InitialMessageOutput - The return type for the getInitialMessage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { GEMINI_MODEL } from '@/lib/ai-models';

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
  model: GEMINI_MODEL,
  input: { schema: InitialMessageInputSchema },
  output: { schema: InitialMessageOutputSchema },
  prompt: `You are GoalLeader, an expert productivity coach. 
Generate a short, friendly, and welcoming initial message for a user named {{name}}. 
Ask how you can help them today. Be creative and avoid being repetitive.
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
    const { output } = await prompt(input);
    return output || `Welcome, ${input.name}! How can I assist you today?`;
  }
);
