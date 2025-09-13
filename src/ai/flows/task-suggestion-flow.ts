
'use server';
/**
 * @fileOverview A flow to generate task suggestions based on a department.
 *
 * - getTaskSuggestions - A function that generates task suggestions.
 * - TaskSuggestionInput - The input type for the getTaskSuggestions function.
 * - TaskSuggestionOutput - The return type for the getTaskSuggestions function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TaskSuggestionInputSchema = z.object({
  department: z.string().describe('The department to generate task suggestions for (e.g., Engineering, Marketing).'),
});
export type TaskSuggestionInput = z.infer<typeof TaskSuggestionInputSchema>;

const TaskSuggestionOutputSchema = z.object({
    suggestions: z.array(z.string()).length(5).describe('An array of 5 task suggestions.')
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
Your task is to generate 5 relevant and actionable task suggestions for a user based on their department.

Department: {{department}}

Please provide 5 concise task suggestions.
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
