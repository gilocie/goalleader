
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

const InitialMessageOutputSchema = z.object({
    greeting: z.string().describe('A short, friendly, and welcoming initial message for the user. Ask how you can help them today. Be creative and avoid being repetitive. Example: "Hi User! Ready to make some progress today? Let me know what you\'d like to work on."'),
});
export type InitialMessageOutput = z.infer<typeof InitialMessageOutputSchema>;

export async function getInitialMessage(input: InitialMessageInput): Promise<string> {
  const result = await initialMessageFlow(input);
  return result.greeting;
}

const prompt = ai.definePrompt({
  name: 'initialMessagePrompt',
  model: GEMINI_MODEL,
  input: { schema: InitialMessageInputSchema },
  output: { schema: InitialMessageOutputSchema },
  prompt: `You are GoalLeader, an expert productivity coach. 
Generate a short, friendly, and welcoming initial message for a user named {{name}}. 
Ask how you can help them today. Be creative and avoid being repetitive.

Output:
{ {{output}} }
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
      if (!output) {
        throw new Error("AI response was empty.");
      }
      return output;
    } catch (error) {
        console.error("Error in initialMessageFlow:", error);
        // Return a safe, default greeting if the AI fails
        return {
            greeting: `Hi ${input.name}! I'm having a little trouble connecting to my creative brain right now, but I'm still here to help. What can I do for you?`
        };
    }
  }
);
