
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

export type InitialMessageOutput = string;

export async function getInitialMessage(input: InitialMessageInput): Promise<InitialMessageOutput> {
  return initialMessageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'initialMessagePrompt',
  input: { schema: InitialMessageInputSchema },
  output: { schema: z.string() },
  prompt: `You are a helpful AI assistant for GoalLeader. Your name is Goal Reader.
You are about to send the first message to the user in a chat. Generate a proactive, friendly, and helpful message.
You can choose one of the following actions:
1. Provide a beautiful and relevant quote from a book to inspire the user.
2. Encourage the user based on their performance.
3. Provide a suggestion for a task to work on from their to-do list.
4. Remind the user of an upcoming meeting.

Choose only one of the above options. Keep the message concise and friendly. If you cannot think of a good message, you can choose to not reply.

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

Select one type of message and generate it. For example, if you choose a quote, just provide the quote and its author. If you choose a reminder, just state the reminder.
`,
});

const initialMessageFlow = ai.defineFlow(
  {
    name: 'initialMessageFlow',
    inputSchema: InitialMessageInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    const { output } = await prompt(input);
    return output || 'Hello! How can I help you achieve your goals today?';
  }
);
