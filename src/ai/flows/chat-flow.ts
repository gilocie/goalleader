'use server';
/**
 * @fileOverview A safe chat flow for GoalReader AI.
 *
 * - chat - The function to call from the frontend.
 * - ChatInput - Input type.
 * - ChatOutput - Output type.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// --- Schema Definitions ---
const MessageSchema = z.object({
  role: z.enum(['user', 'model', 'system']),
  content: z.string(),
});

const ChatInputSchema = z.object({
  history: z.array(MessageSchema),
  message: z.string(),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.string();
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

// --- Main chat function ---
export async function chat(input: ChatInput): Promise<ChatOutput> {
  // Ensure history is never empty
  const safeInput = {
    history:
      Array.isArray(input.history) && input.history.length > 0
        ? input.history
        : [{ role: 'system', content: 'Conversation start' }],
    message: typeof input.message === 'string' ? input.message : '',
  };
  return chatFlow(safeInput);
}

// --- Prompt Definition ---
const chatPrompt = ai.definePrompt({
  name: 'chatPrompt',
  input: { schema: ChatInputSchema },
  output: { schema: ChatOutputSchema },
  prompt: `You are a helpful AI assistant for GoalLeader. Your name is Goal Reader.
You help users with their projects, tasks, and goals.

Here is the chat history:
{{#if history.length}}
{{#each history}}
- {{role}}: {{content}}
{{/each}}
{{else}}
- system: Conversation start
{{/if}}

New message from user:
{{message}}`,
});

// --- Flow Definition ---
const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await chatPrompt(input);

      // Force output to string with fallback
      const safeOutput =
        typeof output === 'string' && output.trim()
          ? output
          : "I'm sorry, I couldn't generate a response. Please try again.";

      return safeOutput;
    } catch (err) {
      console.error('ChatFlow error:', err);
      return "I'm sorry, I couldn't generate a response. Please try again.";
    }
  }
);
