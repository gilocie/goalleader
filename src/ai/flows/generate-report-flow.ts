
'use server';
/**
 * @fileOverview A flow to generate a structured performance report.
 *
 * - generateReport - A function that generates a performance report.
 * - GenerateReportInput - The input type for the report.
 * - GenerateReportOutput - The return type for the report.
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
  tasks: z.array(TaskSchema).describe("The list of completed tasks for the reporting period."),
  period: z.enum(['This Week', 'This Month']).describe('The reporting period.'),
  kpi: z.number().describe('The KPI target percentage set by company.'),
  performance: z.number().describe("The user's actual performance percentage."),
});
export type GenerateReportInput = z.infer<typeof GenerateReportInputSchema>;

// -----------------------
// Output Schema (structured like marketing flow)
// -----------------------
const GenerateReportOutputSchema = z.object({
  summary: z.string().describe('Overall summary of performance.'),
  completedTasks: z.string().describe('Markdown-formatted bulleted list of completed tasks (or message if none).'),
  analysis: z.string().describe('Comparison of performance vs KPI with encouragement.'),
  fullReport: z.string().describe('The full report in Markdown, ready for managers.'),
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
  model: googleAI.model('gemini-1.5-flash'),
  input: { schema: GenerateReportInputSchema },
  output: { schema: GenerateReportOutputSchema },
  config: {
    temperature: 0.7,
    maxOutputTokens: 1200,
  },
  prompt: `
You are a professional AI productivity coach. Generate a **structured JSON report** for a staff member's performance.

### CONTEXT
- Period: {{period}}
- KPI Target: {{kpi}}%
- Staff Performance: {{performance}}%

### TASKS
{{#if tasks.length}}
{{#each tasks}}
- {{name}} (Status: {{status}}){{#if endTime}} completed on {{endTime}}{{/if}}
{{/each}}
{{else}}
- No tasks completed during this period.
{{/if}}

### INSTRUCTIONS
Respond ONLY with valid JSON matching this schema:
{
  "summary": "string (overall summary of performance)",
  "completedTasks": "string (Markdown bullet list of completed tasks, or say 'No tasks completed')",
  "analysis": "string (analysis comparing performance vs KPI)",
  "fullReport": "string (professional Markdown report combining summary, tasks, analysis)"
}

Do not add extra commentary or text outside the JSON.
`,
});

// -----------------------
// Flow (like marketing flow)
// -----------------------
const generateReportFlow = ai.defineFlow(
  {
    name: 'generateReportFlow',
    inputSchema: GenerateReportInputSchema,
    outputSchema: GenerateReportOutputSchema,
  },
  async (input) => {
    const { output } = await reportPrompt(input);

    if (!output || !output.fullReport) {
      throw new Error('Failed to generate report. The model did not return fullReport.');
    }
    return output;
  }
);
