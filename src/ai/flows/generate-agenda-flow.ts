'use server';
/**
 * @fileOverview A flow to generate a meeting agenda.
 *
 * - generateAgenda - A function that generates a meeting agenda.
 * - GenerateAgendaInput - The input type for the generateAgenda function.
 * - GenerateAgendaOutput - The return type for the generateAgenda function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateAgendaInputSchema = z.object({
  title: z.string().describe('The title of the meeting.'),
  reason: z.string().describe('The reason or context for the meeting.'),
});
export type GenerateAgendaInput = z.infer<typeof GenerateAgendaInputSchema>;

const GenerateAgendaOutputSchema = z.string();
export type GenerateAgendaOutput = z.infer<typeof GenerateAgendaOutputSchema>;

export async function generateAgenda(input: GenerateAgendaInput): Promise<GenerateAgendaOutput> {
  return generateAgendaFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAgendaPrompt',
  input: { schema: GenerateAgendaInputSchema },
  output: { schema: GenerateAgendaOutputSchema },
  prompt: `You are a helpful AI assistant. Your task is to generate a concise and structured meeting agenda based on the provided title and reason.

The agenda should include:
- A brief introduction/objective.
- 2-3 key talking points or topics.
- A concluding point for next steps or action items.

Format the output as a single string with markdown for clarity (e.g., using bullet points).

Meeting Title: {{title}}
Reason: {{reason}}
`,
});

const generateAgendaFlow = ai.defineFlow(
  {
    name: 'generateAgendaFlow',
    inputSchema: GenerateAgendaInputSchema,
    outputSchema: GenerateAgendaOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await prompt(input);
      return output || 'Could not generate an agenda at this time.';
    } catch (error) {
      console.error('Error generating agenda:', error);
      return 'An error occurred while generating the agenda. Please try again.';
    }
  }
);
