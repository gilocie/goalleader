
'use server';
/**
 * @fileOverview A flow to generate performance advice for the user.
 *
 * - getPerformanceAdvice - A function that generates performance advice.
 * - PerformanceAdviceInput - The input type for the getPerformanceAdvice function.
 * - PerformanceAdviceOutput - The return type for the getPerformance-advice-flow function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { GEMINI_MODEL } from '@/lib/ai-models';

const TaskSchema = z.object({
  name: z.string(),
  status: z.string(),
  dueDate: z.string(),
  duration: z.number().optional(),
});

const PerformanceAdviceInputSchema = z.object({
  staffName: z.string().describe("The name of the staff member being reviewed."),
  teamLeaderName: z.string().describe("The name of the Team Leader viewing the report."),
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
  model: GEMINI_MODEL,
  input: { schema: PerformanceAdviceInputSchema.extend({ isHighPerformer: z.boolean() }) },
  output: { schema: PerformanceAdviceOutputSchema },
  prompt: `You are GoalLeader, an AI performance coach partnering with a Team Leader. Your goal is to provide a humanized, detailed, and actionable summary about a staff member's performance. The staff member's name is {{staffName}}.

The company's Key Performance Indicator (KPI) for task completion is {{kpi}}%. {{staffName}}'s current performance is {{performance}}%.

Address the Team Leader, {{teamLeaderName}}, directly and use a collaborative tone (e.g., "we should," "I suggest").

{{#if completedTasks.length}}
  {{#if isHighPerformer}}
    // HIGH PERFORMER
    Your 'title' should be "Excellent Momentum!".
    Your 'advice' for {{teamLeaderName}} should celebrate {{staffName}}'s achievements and identify what's working well. Suggest how we can build on this momentum. Propose recognizing their hard work.

    Use this Markdown structure for the 'advice' field:
- A short, conversational summary for the Team Leader.
- A "### Key Achievements" section with a bulleted list.
- An "### Our Next Steps" section suggesting how to leverage this success (e.g., mentorship opportunities, stretch goals).
  {{else}}
    // NEEDS IMPROVEMENT
    Your 'title' should be "Opportunity for Growth".
    Your 'advice' for {{teamLeaderName}} should identify potential root causes for being below the KPI and provide specific, constructive feedback. Propose a clear, supportive action plan.

    Use this Markdown structure for the 'advice' field:
- A short, conversational summary for the Team Leader, framing this as a coaching opportunity.
- A "### Areas to Focus On" section with a bulleted list (e.g., missed deadlines, task types they struggle with).
- A "### Recommended Action Plan" section with a bulleted list of actionable recommendations for the Team Leader to implement with {{staffName}}.
  {{/if}}

Staff member's completed tasks:
{{#each completedTasks}}
- "{{name}}" (Completed in {{duration}} seconds)
{{/each}}

{{else}}
  // NO TASKS COMPLETED (FRESH START)
  Your 'title' should be "Ready to Start!".
  Your 'advice' for {{teamLeaderName}} should be a detailed, encouraging message. Address the Team Leader by name and outline a proactive plan.

  Use this Markdown structure for the 'advice' field:
- Start with: "I'm glad you're here, {{teamLeaderName}}. It looks like a fresh start for {{staffName}}..."
- An "### Our Recommended Approach" section with a bulleted list of 3 concrete steps:
    - **Proactive Engagement:** Suggest a supportive conversation to set clear initial goals.
    - **Task Breakdown:** Recommend breaking down initial tasks into smaller, manageable parts.
    - **Support & Monitoring:** Emphasize regular check-ins and my role in monitoring progress.
- Conclude with a collaborative statement like: "Together, we can help {{staffName}} find their rhythm and excel."
{{/if}}
`,
});

const performanceAdviceFlow = ai.defineFlow(
  {
    name: 'performanceAdviceFlow',
    inputSchema: PerformanceAdviceInputSchema,
    outputSchema: PerformanceAdviceOutputSchema,
  },
  async (input) => {
    const isHighPerformer = input.performance >= input.kpi;
    const promptInput = { ...input, isHighPerformer };
    const { output } = await prompt(promptInput);
    if (output) {
      return output;
    }
    throw new Error('No output from prompt');
  }
);

