'use server';
/**
 * @fileOverview A flow to generate performance advice for the user.
 *
 * - getPerformanceAdvice - A function that generates performance advice.
 * - PerformanceAdviceInput - The input type for the getPerformanceAdvice function.
 * - PerformanceAdviceOutput - The return type for the getPerformanceAdvice function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TaskSchema = z.object({
  name: z.string(),
  status: z.string(),
  dueDate: z.string(),
  duration: z.number().optional(),
});

const PerformanceAdviceInputSchema = z.object({
  completedTasks: z.array(TaskSchema).describe('The user\'s list of completed tasks for a given period.'),
  kpi: z.number().describe('The key performance indicator (KPI) for task completion, as a percentage.'),
  performance: z.number().describe('The user\'s current performance percentage.'),
});
export type PerformanceAdviceInput = z.infer<typeof PerformanceAdviceInputSchema>;

const PerformanceAdviceOutputSchema = z.object({
  title: z.string(),
  advice: z.string(),
});

export type PerformanceAdviceOutput = z.infer<typeof PerformanceAdviceOutputSchema>;

export async function getPerformanceAdvice(input: PerformanceAdviceInput): Promise<PerformanceAdviceOutput> {
  return performanceAdviceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'performanceAdvicePrompt',
  input: { schema: PerformanceAdviceInputSchema },
  output: { schema: PerformanceAdviceOutputSchema },
  prompt: `You are an AI performance coach for GoalLeader. Your goal is to provide feedback to the user based on their task completion performance.

The company's Key Performance Indicator (KPI) for task completion is {{kpi}}%. The user's current performance is {{performance}}%.

Analyze the user's completed tasks and performance score.
- If the user's performance is at or above the KPI, provide encouraging feedback.
- If the user's performance is below the KPI, provide actionable advice on how they can improve.

Keep the advice concise, friendly, and constructive.

User's completed tasks:
{{#each completedTasks}}
- {{name}} (Completed in {{duration}} seconds)
{{/each}}
`,
});

const performanceAdviceFlow = ai.defineFlow(
  {
    name: 'performanceAdviceFlow',
    inputSchema: PerformanceAdviceInputSchema,
    outputSchema: PerformanceAdviceOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
