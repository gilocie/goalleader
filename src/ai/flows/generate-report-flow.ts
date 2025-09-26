
'use server';
/**
 * @fileOverview A flow to generate a structured performance report based on completed tasks.
 *
 * - generateReport - A function that generates a performance report.
 * - GenerateReportInput - The input type for the generateReport function.
 * - GenerateReportOutput - The return type for the generateReport function.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'zod';

// -----------------------
// Task and Input Schema
// -----------------------
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

// -----------------------
// Output Schema (structured instead of plain string)
// -----------------------
const GenerateReportOutputSchema = z.object({
  summary: z.string().describe('Overall summary of performance.'),
  tasksList: z.string().describe('Markdown-formatted bullet list of completed tasks.'),
  analysis: z.string().describe('Performance analysis vs KPI.'),
  fullReport: z.string().describe('The final report ready for managers (Markdown).'),
});
export type GenerateReportOutput = z.infer<typeof GenerateReportOutputSchema>;

// -----------------------
// Public Function
// -----------------------
export async function generateReport(input: GenerateReportInput): Promise<GenerateReportOutput> {
  return generateReportFlow(input);
}

// -----------------------
// Prompt
// -----------------------
const reportPrompt = ai.definePrompt({
  name: 'generateReportPrompt',
  model: googleAI.model('models/gemini-1.5-flash'),
  input: { schema: GenerateReportInputSchema },
  output: { schema: GenerateReportOutputSchema },
  config: {
    temperature: 0.7,
    maxOutputTokens: 1200,
  },
  prompt: `
You are an AI assistant for GoalLeader. Your task is to generate a structured performance report for a staff member, to be read by their manager.

REPORT CONTEXT:
- Period: {{period}}
- Target KPI: {{kpi}}%
- Staff Performance: {{performance}}%

TASKS:
{{#if tasks.length}}
  {{#each tasks}}
  - "{{name}}" (Status: {{status}}){{#if endTime}} — completed on {{endTime}}{{/if}}
  {{/each}}
{{else}}
- No tasks were completed during this period.
{{/if}}


GUIDELINES:
1. Create a **professional summary** of performance.
2. If tasks were completed, provide a **bulleted list in Markdown** of key completed tasks. If not, state that no tasks were completed.
3. Add a **short analysis** of performance vs KPI, including congratulations (if >KPI) or encouragement (if <KPI).
4. Return both structured JSON fields and a **`fullReport` field containing the whole thing composed in Markdown**.

FORMAT YOUR OUTPUT AS:
- summary
- tasksList
- analysis
- fullReport (Markdown string)

Reply in the expected JSON schema.
`,
});

// -----------------------
// Flow
// -----------------------
const generateReportFlow = ai.defineFlow(
  {
    name: 'generateReportFlow',
    inputSchema: GenerateReportInputSchema,
    outputSchema: GenerateReportOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await reportPrompt(input);

      if (!output || !output.fullReport) {
        throw new Error('Invalid AI response: ' + JSON.stringify(output));
      }

      return output;
    } catch (error) {
      console.error('Error generating report:', error);
      return {
        summary: 'N/A',
        tasksList: '- No tasks available.',
        analysis: 'Unable to compute KPI analysis.',
        fullReport: '⚠️ An error occurred while generating the report. Please try again.',
      };
    }
  }
);
