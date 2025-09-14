
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
  prompt: `You are an AI performance analyst for GoalLeader. Your goal is to provide a summary to a team leader about their staff member's performance.

The company's Key Performance Indicator (KPI) for task completion is {{kpi}}%. The staff member's current performance is {{performance}}%.

Analyze the staff member's performance based on their completed tasks and performance score.
- If performance is at or above the KPI, highlight their strengths and achievements.
- If performance is below the KPI, identify areas for improvement and provide constructive feedback for the team leader to discuss with the staff member.
- Mention specific areas where the staff member is doing well and where they are not performing as expected.

The tone should be professional and analytical, suitable for a manager reviewing a team member.

Staff member's completed tasks:
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
    try {
      const { output } = await prompt(input);
      if (output) {
        return output;
      }
      throw new Error('No output from prompt');
    } catch (err) {
      console.error('PerformanceAdviceFlow error:', err);
      // Return a default/fallback object that matches the output schema
      return {
        title: 'Performance Analysis Unavailable',
        advice: 'Sorry, I couldn\'t fetch your performance advice right now. Please try again in a few moments.',
      };
    }
  }
);
