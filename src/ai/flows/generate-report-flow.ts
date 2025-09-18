
'use server';
/**
 * @fileOverview A flow to generate a performance report based on completed tasks.
 *
 * - generateReport - A function that generates a performance report.
 * - GenerateReportInput - The input type for the generateReport function.
 * - GenerateReportOutput - The return type for the generateReport function.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'zod';

const TaskSchema = z.object({
  name: z.string(),
  status: z.string(),
  dueDate: z.string(),
  duration: z.number().optional(),
  endTime: z.string().optional(),
});

const GenerateReportInputSchema = z.object({
  tasks: z.array(TaskSchema).describe("The user's list of completed tasks for the reporting period."),
  period: z.enum(['This Week', 'This Month']).describe('The reporting period.'),
  kpi: z.number().describe('The key performance indicator (KPI) for task completion, as a percentage.'),
  performance: z.number().describe("The user's current performance percentage for the period."),
});
export type GenerateReportInput = z.infer<typeof GenerateReportInputSchema>;

const GenerateReportOutputSchema = z.string();
export type GenerateReportOutput = z.infer<typeof GenerateReportOutputSchema>;

export async function generateReport(input: GenerateReportInput): Promise<GenerateReportOutput> {
  return generateReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateReportPrompt',
  model: googleAI.model('gemini-1.5-flash'),
  input: { schema: GenerateReportInputSchema },
  output: { schema: GenerateReportOutputSchema },
  prompt: `You are an AI assistant for GoalLeader. Your task is to generate a performance report for a staff member to their manager.

The report is for the period: {{period}}.
The company's target KPI is {{kpi}}%. The staff member's performance for this period is {{performance}}%.

Based on the completed tasks provided, generate a summary of what the staff member has accomplished. The report should be structured, professional, and highlight key achievements.

Include:
- An overall summary of performance.
- A bulleted list of key completed tasks with their completion dates.
- An analysis of the performance rate against the KPI.

Completed Tasks:
{{#each tasks}}
- "{{name}}" completed on {{endTime}}.
{{/each}}

Generate the report content as a single string, ready to be sent to a manager.
`,
});

const generateReportFlow = ai.defineFlow(
  {
    name: 'generateReportFlow',
    inputSchema: GenerateReportInputSchema,
    outputSchema: GenerateReportOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await prompt(input);
      return output || 'Could not generate a report at this time.';
    } catch (error) {
      console.error('Error generating report:', error);
      return 'An error occurred while generating the report. Please try again.';
    }
  }
);
