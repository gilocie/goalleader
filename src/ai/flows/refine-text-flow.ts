
'use server';
/**
 * @fileOverview A flow to refine user-provided text and check for completeness.
 *
 * - refineText - A function that takes a string and a list of tasks, and returns a refined version.
 * - RefineTextInput - The input type for the refineText function.
 * - RefineTextOutput - The return type for the refineText function.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'zod';

const TaskSchema = z.object({
  name: z.string(),
  endTime: z.string().optional(),
});

const RefineTextInputSchema = z.object({
  report: z.string().describe('The user-written performance report.'),
  tasks: z.array(TaskSchema).describe('The list of all completed tasks for the period.'),
});
export type RefineTextInput = z.infer<typeof RefineTextInputSchema>;

const RefineTextOutputSchema = z.string();
export type RefineTextOutput = z.infer<typeof RefineTextOutputSchema>;

export async function refineText(input: RefineTextInput): Promise<RefineTextOutput> {
  return refineTextFlow(input);
}

const refineTextPrompt = ai.definePrompt({
  name: 'refineTextPrompt',
  model: googleAI.model('gemini-pro'),
  input: { schema: RefineTextInputSchema },
  output: { schema: RefineTextOutputSchema },
  prompt: `You are a writing assistant. Your task is to take the user\\'s performance report and refine it.
Correct any grammatical errors or typos.
Ensure the tone is professional and clear.
Check the user\\'s report against the list of completed tasks provided below. If the user missed mentioning any significant tasks, add them to the report in a natural way.
Do not add any information that is not present in the original text or the provided task list.

Original report:
"{{report}}"

List of completed tasks for the period:
{{#each tasks}}
- {{name}} (Completed on: {{endTime}})
{{/each}}

Return only the final, refined report content as a single string.`,
});

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
