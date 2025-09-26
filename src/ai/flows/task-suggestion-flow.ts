
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
import { GEMINI_MODEL } from '@/lib/ai-models';

const PendingTaskSchema = z.object({
  name: z.string(),
  endTime: z.string().describe("The end time of the task in HH:mm format."),
});

const TaskSuggestionInputSchema = z.object({
  department: z.string().describe("The user's department (e.g., Engineering, Marketing)."),
  currentTime: z.string().describe("The current time in HH:mm format."),
  pendingTasks: z.array(PendingTaskSchema).describe("A list of the user's pending tasks for today."),
});
export type TaskSuggestionInput = z.infer<typeof TaskSuggestionInputSchema>;

const SuggestionSchema = z.object({
    title: z.string().describe('A short, concise title for the task (max 5 words).'),
    description: z.string().describe('A detailed description of what the task involves.'),
    duration: z.string().describe('A suggested time duration, e.g., "30min", "1hr", "2.5hr".'),
    startTime: z.string().describe('A suggested start time in HH:mm format, e.g., "09:00".'),
    endTime: z.string().describe('A suggested end time in HH:mm format, e.g., "11:30".'),
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
  model: GEMINI_MODEL,
  input: { schema: TaskSuggestionInputSchema },
  output: { schema: TaskSuggestionOutputSchema },
  prompt: `You are an assistant for GoalLeader, a project management tool.
Your task is to generate 3 relevant and actionable task suggestions for a user based on their role in the company.

The current time is {{currentTime}}.
The user has the following tasks already scheduled for today:
{{#if pendingTasks.length}}
{{#each pendingTasks}}
- {{name}} (ends at {{endTime}})
{{/each}}
{{else}}
- No pending tasks.
{{/if}}

Please analyze the current time and the last pending task's end time. Generate 3 new task suggestions that start AFTER the later of the current time or the last task's end time. Do not suggest tasks for times that have already passed.

For each suggestion, provide a short title, a detailed description, a suggested duration, and calculate a realistic start time and end time.
Ensure the start times are in the future and do not overlap with existing tasks.

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
