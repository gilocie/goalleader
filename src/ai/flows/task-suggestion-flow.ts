
'use server';
/**
 * @fileOverview A flow to generate task suggestions based on a user's role.
 *
 * - getTaskSuggestions - A function that generates task suggestions.
 * - TaskSuggestionInput - The input type for the getTaskSuggestions function.
 * - TaskSuggestionOutput - The return type for the getTaskSuggestions function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const TaskSuggestionInputSchema = z.object({
  department: z.string().describe("The user's department (e.g., Engineering, Marketing)."),
});
export type TaskSuggestionInput = z.infer<typeof TaskSuggestionInputSchema>;

const SuggestionSchema = z.object({
    title: z.string().describe('A short, concise title for the task (max 5 words).'),
    description: z.string().describe('A detailed description of what the task involves.'),
    duration: z.string().describe('A suggested time duration, e.g., "30min", "1hr", "2.5hr".'),
});

const TaskSuggestionOutputSchema = z.object({
    suggestions: z.array(SuggestionSchema).length(3).describe('An array of 3 task suggestions.')
});
export type TaskSuggestionOutput = z.infer<typeof TaskSuggestionOutputSchema>;

export async function getTaskSuggestions(input: TaskSuggestionInput): Promise<TaskSuggestionOutput> {
  return taskSuggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'taskSuggestionPrompt',
  input: { schema: TaskSuggestionInputSchema },
  output: { schema: TaskSuggestionOutputSchema },
  prompt: `You are an assistant for GoalLeader, a project management tool.
Your task is to generate 3 relevant and actionable task suggestions for a user based on their role in the company.

For each suggestion, provide a short title, a detailed description, and a suggested duration.

User's Department: {{department}}

Please provide 3 concise task suggestions to help the user make progress and contribute effectively.
`,
});

const taskSuggestionFlow = ai.defineFlow(
  {
    name: 'taskSuggestionFlow',
    inputSchema: TaskSuggestionInputSchema,
    outputSchema: TaskSuggestionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
