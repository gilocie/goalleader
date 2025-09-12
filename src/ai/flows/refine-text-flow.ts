'use server';
/**
 * @fileOverview A flow to refine user-provided text.
 *
 * - refineText - A function that takes a string and returns a refined version.
 * - RefineTextInput - The input type for the refineText function.
 * - RefineTextOutput - The return type for the refineText function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const RefineTextInputSchema = z.string();
export type RefineTextInput = z.infer<typeof RefineTextInputSchema>;

const RefineTextOutputSchema = z.string();
export type RefineTextOutput = z.infer<typeof RefineTextOutputSchema>;

export async function refineText(input: RefineTextInput): Promise<RefineTextOutput> {
  return refineTextFlow(input);
}

const refineTextPrompt = ai.definePrompt(
  {
    name: 'refineTextPrompt',
    input: { schema: RefineTextInputSchema },
    output: { schema: RefineTextOutputSchema },
    prompt: `You are a writing assistant. Your task is to take the user's input and refine it to be more professional, clear, and concise. Correct any grammatical errors or typos. Do not add any information that is not present in the original text.

Original text:
"{{prompt}}"

Refined text:`,
  },
);

const refineTextFlow = ai.defineFlow(
  {
    name: 'refineTextFlow',
    inputSchema: RefineTextInputSchema,
    outputSchema: RefineTextOutputSchema,
  },
  async (input) => {
    const { output } = await refineTextPrompt(input);
    return output!;
  }
);
