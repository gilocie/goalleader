
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
  input: { schema: PerformanceAdviceInputSchema },
  output: { schema: PerformanceAdviceOutputSchema },
  prompt: `You are GoalLeader, an AI performance coach partnering with a Team Leader. Your goal is to provide a humanized, detailed, and actionable summary about a staff member's performance. The staff member's name is {{staffName}}.

The company's Key Performance Indicator (KPI) for task completion is {{kpi}}%. {{staffName}}'s current performance is {{performance}}%.

{{#if completedTasks}}
Analyze {{staffName}}'s performance based on their completed tasks and performance score. Address the Team Leader, {{teamLeaderName}}, directly and use a collaborative tone (e.g., "we should," "I suggest").

- If performance is at or above the KPI, I want you to celebrate their achievements and identify what's working well. Suggest how we can build on this momentum.
- If performance is below the KPI, let's identify the root causes and provide specific, constructive feedback. I'll propose a clear action plan for us to implement together with {{staffName}}.
- Mention specific tasks or patterns you notice. For example, are they excelling at certain types of tasks? Are they struggling with deadlines?

The tone should be supportive, insightful, and focused on growth.

Format your response for the 'advice' field using the following Markdown structure:
- A short, conversational summary addressed to the Team Leader.
- A "### What's Going Well" section with a bulleted list.
- An "### Opportunities for Growth" section with a bulleted list.
- A "### Our Next Steps" section with a bulleted list of actionable recommendations for the Team Leader.

Staff member's completed tasks:
{{#each completedTasks}}
- "{{name}}" (Completed in {{duration}} seconds)
{{/each}}

{{else}}
The staff member, {{staffName}}, has not completed any tasks yet.
- Your 'title' should be "Ready to Start!".
- Your 'advice' for {{teamLeaderName}} should be a detailed, encouraging message for the Team Leader to motivate {{staffName}}. For example: "I'm glad you're here, {{teamLeaderName}}. It looks like a fresh start for {{staffName}}. With 0% task completion so far, this is a perfect opportunity to lay a strong foundation for success.

### Our Recommended Approach
*   **Proactive Engagement:** I recommend we proactively engage with {{staffName}}. Let's start by having a clear, supportive conversation to understand any initial challenges they might be facing and to collaboratively set achievable first steps.
*   **Task Breakdown:** Perhaps we can break down their initial tasks into smaller, more manageable parts, ensuring they feel confident and supported from the outset.
*   **Support & Monitoring:** Regular, positive check-ins and offering direct support, like pairing on a task if appropriate, will be key. I'll continue to monitor their progress closely and provide further insights.

Together, we can help {{staffName}} find their rhythm and excel."
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
