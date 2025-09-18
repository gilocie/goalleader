
'use server';
/**
 * @fileOverview A flow to generate a proactive initial message for the GoalReader AI.
 *
 * - getInitialMessage - A function that generates an initial message.
 * - InitialMessageInput - The input type for the getInitialMessage function.
 * - InitialMessageOutput - The return type for the getInitialMessage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TaskSchema = z.object({
  name: z.string(),
  status: z.string(),
  dueDate: z.string(),
});

const MeetingSchema = z.object({
    title: z.string(),
    time: z.string(),
});

const InitialMessageInputSchema = z.object({
  performance: z.number().describe('The user\'s current overall performance percentage.'),
  tasks: z.array(TaskSchema).describe('The user\'s list of to-do items.'),
  meetings: z.array(MeetingSchema).describe('The user\'s list of upcoming meetings.'),
});
export type InitialMessageInput = z.infer<typeof InitialMessageInputSchema>;

const InitialMessageOutputSchema = z.string();
export type InitialMessageOutput = z.infer<typeof InitialMessageOutputSchema>;

export async function getInitialMessage(input: InitialMessageInput): Promise<InitialMessageOutput> {
  return initialMessageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'initialMessagePrompt',
  input: { schema: InitialMessageInputSchema },
  output: { schema: z.string() },
  prompt: `You are a helpful and encouraging AI assistant for GoalLeader. Your name is Goal Reader.
You are about to send the first message to the user in a chat. Your goal is to provide a proactive, friendly, and highly relevant message.

Analyze the user's context and choose ONE of the following actions:
1.  **Share a Quote:** If you find a relevant quote, share it. For example, if performance is high, find a quote about success. If it's low, find one about perseverance.
2.  **Give Encouragement:** Based on their performance, offer specific encouragement. If they are doing well, praise them. If they are struggling, motivate them.
3.  **Suggest a Task:** Recommend a specific task from their to-do list that they could work on next.
4.  **Remind about a Meeting:** If there is a meeting coming up soon, provide a gentle reminder.

Your choice should be directly influenced by the data provided. Be concise, friendly, and motivational.

Here is the user's current context:
- Overall Performance: {{performance}}%
- To-Do List:
{{#each tasks}}
  - {{name}} (Status: {{status}}, Due: {{dueDate}})
{{/each}}
- Upcoming Meetings:
{{#each meetings}}
  - {{title}} at {{time}}
{{/each}}

Select the most appropriate message type and generate it. For example, if you choose a quote, just provide the quote and its author. If you choose encouragement, make it personal and specific.
`,
});

const initialMessageFlow = ai.defineFlow(
  {
    name: 'initialMessageFlow',
    inputSchema: InitialMessageInputSchema,
    outputSchema: InitialMessageOutputSchema,
  },
  async (input) => {
    try {
        const { output } = await prompt(input);
        const safeOutput =
            output && typeof output === 'string' && output.trim()
            ? output
            : 'AI failed to generate an initial message.';
        return safeOutput;
    } catch (err) {
        console.error('InitialMessageFlow error:', err);
        return 'Error generating initial message. Please check the logs.';
    }
  }
);
